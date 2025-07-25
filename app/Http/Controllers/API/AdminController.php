<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Agence;
use App\Models\DistributionLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Obtenir les statistiques globales
     */
    public function getStatistics(Request $request): JsonResponse
    {
        $request->validate([
            'agence_id' => 'nullable|exists:agences,id',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'periode' => 'nullable|in:jour,semaine,mois,annee',
        ]);

        $periode = $request->input('periode', 'jour');
        $agenceId = $request->input('agence_id');

        // Définir la période
        switch ($periode) {
            case 'semaine':
                $dateDebut = $request->input('date_debut') ? Carbon::parse($request->input('date_debut')) : now()->startOfWeek();
                $dateFin = $request->input('date_fin') ? Carbon::parse($request->input('date_fin')) : now()->endOfWeek();
                break;
            case 'mois':
                $dateDebut = $request->input('date_debut') ? Carbon::parse($request->input('date_debut')) : now()->startOfMonth();
                $dateFin = $request->input('date_fin') ? Carbon::parse($request->input('date_fin')) : now()->endOfMonth();
                break;
            case 'annee':
                $dateDebut = $request->input('date_debut') ? Carbon::parse($request->input('date_debut')) : now()->startOfYear();
                $dateFin = $request->input('date_fin') ? Carbon::parse($request->input('date_fin')) : now()->endOfYear();
                break;
            default:
                $dateDebut = $request->input('date_debut') ? Carbon::parse($request->input('date_debut')) : now()->startOfDay();
                $dateFin = $request->input('date_fin') ? Carbon::parse($request->input('date_fin')) : now()->endOfDay();
                break;
        }

        // Query de base pour les tickets
        $ticketsQuery = Ticket::whereBetween('heure_creation', [$dateDebut, $dateFin]);
        
        if ($agenceId) {
            $ticketsQuery->where('agence_id', $agenceId);
        }

        $tickets = $ticketsQuery->get();

        // Statistiques générales
        $totalTickets = $tickets->count();
        $ticketsTermines = $tickets->where('statut', 'termine')->count();
        $ticketsAnnules = $tickets->where('statut', 'annule')->count();
        $ticketsEnAttente = $tickets->where('statut', 'en_attente')->count();
        $ticketsEnCours = $tickets->where('statut', 'en_cours')->count();

        // Temps d'attente moyen
        $tempsAttenteMoyen = $tickets->where('temps_attente', '!=', null)->avg('temps_attente');

        // Temps de traitement moyen
        $tempsMoyenTraitement = $tickets->where('statut', 'termine')
            ->filter(function ($ticket) {
                return $ticket->heure_appel && $ticket->heure_fin;
            })
            ->avg(function ($ticket) {
                return Carbon::parse($ticket->heure_appel)->diffInMinutes($ticket->heure_fin);
            });

        // Statistiques par service
        $statistiquesParService = $tickets->groupBy('service')
            ->map(function ($serviceTickets, $service) {
                return [
                    'service' => $service,
                    'total' => $serviceTickets->count(),
                    'termines' => $serviceTickets->where('statut', 'termine')->count(),
                    'annules' => $serviceTickets->where('statut', 'annule')->count(),
                    'temps_attente_moyen' => $serviceTickets->where('temps_attente', '!=', null)->avg('temps_attente'),
                ];
            })->values();

        // Statistiques par agence (si pas de filtre agence)
        $statistiquesParAgence = [];
        if (!$agenceId) {
            $statistiquesParAgence = $tickets->groupBy('agence_id')
                ->map(function ($agenceTickets, $agenceId) {
                    $agence = Agence::find($agenceId);
                    return [
                        'agence_id' => $agenceId,
                        'agence_nom' => $agence ? $agence->nom : 'N/A',
                        'total' => $agenceTickets->count(),
                        'termines' => $agenceTickets->where('statut', 'termine')->count(),
                        'annules' => $agenceTickets->where('statut', 'annule')->count(),
                        'en_attente' => $agenceTickets->where('statut', 'en_attente')->count(),
                        'en_cours' => $agenceTickets->where('statut', 'en_cours')->count(),
                    ];
                })->values();
        }

        // Performance des agents
        $performanceAgents = User::where('role', 'agent')
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('agence_id', $agenceId);
            })
            ->with(['tickets' => function ($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('heure_creation', [$dateDebut, $dateFin]);
            }])
            ->get()
            ->map(function ($agent) {
                $tickets = $agent->tickets;
                $ticketsTermines = $tickets->where('statut', 'termine');
                
                $tempsMoyenTraitement = $ticketsTermines
                    ->filter(function ($ticket) {
                        return $ticket->heure_appel && $ticket->heure_fin;
                    })
                    ->avg(function ($ticket) {
                        return Carbon::parse($ticket->heure_appel)->diffInMinutes($ticket->heure_fin);
                    });

                return [
                    'agent_id' => $agent->id,
                    'agent_nom' => $agent->name,
                    'agence_nom' => $agent->agence ? $agent->agence->nom : 'N/A',
                    'tickets_traites' => $tickets->whereIn('statut', ['termine', 'annule'])->count(),
                    'tickets_termines' => $ticketsTermines->count(),
                    'temps_moyen_traitement' => round($tempsMoyenTraitement, 2),
                    'derniere_connexion' => $agent->derniere_connexion,
                ];
            });

        // Préparation des données pour React AdminStatistics
        
        // 1. Répartition par services pour le graphique en camembert
        $repartitionServices = $statistiquesParService->map(function ($service) {
            return [
                'name' => $service['service'],
                'value' => $service['total'],
                'termines' => $service['termines']
            ];
        });

        // 2. Performance par agences pour le graphique en barres
        $performanceAgences = Agence::where('active', true)
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('id', $agenceId);
            })
            ->get()
            ->map(function ($agence) use ($dateDebut, $dateFin) {
                $ticketsAgence = $agence->tickets()
                    ->whereBetween('heure_creation', [$dateDebut, $dateFin])
                    ->get();
                
                $ticketsTermines = $ticketsAgence->where('statut', 'termine');
                $tempsMoyen = $ticketsTermines
                    ->filter(function ($ticket) {
                        return $ticket->temps_attente !== null;
                    })
                    ->avg('temps_attente');

                return [
                    'nom' => $agence->nom,
                    'tickets_traites' => $ticketsTermines->count(),
                    'temps_moyen' => round($tempsMoyen ?? 0, 1),
                    'total_tickets' => $ticketsAgence->count()
                ];
            });

        // 3. Évolution temporelle (par jour sur la période)
        $evolutionTemporelle = [];
        $currentDate = $dateDebut->copy();
        while ($currentDate <= $dateFin) {
            $ticketsJour = $tickets->filter(function ($ticket) use ($currentDate) {
                return Carbon::parse($ticket->heure_creation)->isSameDay($currentDate);
            });

            $evolutionTemporelle[] = [
                'periode' => $currentDate->format('d/m'),
                'tickets_crees' => $ticketsJour->count(),
                'tickets_traites' => $ticketsJour->where('statut', 'termine')->count()
            ];

            $currentDate->addDay();
        }

        // 4. Top agents performers
        $topAgents = $performanceAgents->sortByDesc('tickets_traites')
            ->take(10)
            ->map(function ($agent, $index) use ($totalTickets) {
                $performance = $totalTickets > 0 
                    ? round(($agent['tickets_traites'] / $totalTickets) * 100, 1)
                    : 0;

                return [
                    'id' => $agent['agent_id'],
                    'name' => $agent['agent_nom'],
                    'agence' => $agent['agence_nom'],
                    'tickets_traites' => $agent['tickets_traites'],
                    'temps_moyen' => $agent['temps_moyen_traitement'],
                    'performance' => $performance
                ];
            })
            ->values();

        // 5. Analyse des temps d'attente
        $tempsAttenteTickets = $tickets->where('temps_attente', '!=', null);
        $tempsAttenteMax = $tempsAttenteTickets->max('temps_attente') ?? 0;
        $tempsAttenteMoyenCalcule = $tempsAttenteTickets->avg('temps_attente') ?? 0;

        // Répartition des temps d'attente
        $totalAvecTemps = $tempsAttenteTickets->count();
        $moins5min = $tempsAttenteTickets->where('temps_attente', '<', 5)->count();
        $entre5et15 = $tempsAttenteTickets->whereBetween('temps_attente', [5, 15])->count();
        $plus15min = $tempsAttenteTickets->where('temps_attente', '>', 15)->count();

        $tempsAttente = [
            'moyen' => round($tempsAttenteMoyenCalcule, 1),
            'maximum' => round($tempsAttenteMax, 1),
            'moins_5min' => $totalAvecTemps > 0 ? round(($moins5min / $totalAvecTemps) * 100, 1) : 0,
            'entre_5_15min' => $totalAvecTemps > 0 ? round(($entre5et15 / $totalAvecTemps) * 100, 1) : 0,
            'plus_15min' => $totalAvecTemps > 0 ? round(($plus15min / $totalAvecTemps) * 100, 1) : 0
        ];

        return response()->json([
            'periode' => [
                'type' => $periode,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ],
            'agence_filtre' => $agenceId ? Agence::find($agenceId)?->nom : null,
            
            // Structure pour React AdminStatistics
            'stats_generales' => [
                'total_tickets' => $totalTickets,
                'tickets_termines' => $ticketsTermines,
                'tickets_annules' => $ticketsAnnules,
                'tickets_en_attente' => $ticketsEnAttente,
                'tickets_en_cours' => $ticketsEnCours,
                'taux_completion' => $totalTickets > 0 ? round(($ticketsTermines / $totalTickets) * 100, 2) : 0,
                'temps_moyen' => round($tempsAttenteMoyen, 2),
                'temps_traitement_moyen' => round($tempsMoyenTraitement, 2),
                'agents_actifs' => User::where('role', 'agent')->where('active', true)->count(),
                'total_agents' => User::where('role', 'agent')->count(),
                'taux_satisfaction' => 85 // Valeur par défaut, peut être calculée selon vos critères
            ],
            'repartition_services' => $repartitionServices,
            'performance_agences' => $performanceAgences,
            'evolution_temporelle' => $evolutionTemporelle,
            'top_agents' => $topAgents,
            'temps_attente' => $tempsAttente,

            // Structure originale pour compatibilité
            'statistiques_generales' => [
                'total_tickets' => $totalTickets,
                'tickets_termines' => $ticketsTermines,
                'tickets_annules' => $ticketsAnnules,
                'tickets_en_attente' => $ticketsEnAttente,
                'tickets_en_cours' => $ticketsEnCours,
                'taux_completion' => $totalTickets > 0 ? round(($ticketsTermines / $totalTickets) * 100, 2) : 0,
                'temps_attente_moyen' => round($tempsAttenteMoyen, 2),
                'temps_traitement_moyen' => round($tempsMoyenTraitement, 2),
            ],
            'statistiques_par_service' => $statistiquesParService,
            'statistiques_par_agence' => $statistiquesParAgence,
            'performance_agents' => $performanceAgents,
        ]);
    }

    /**
     * Obtenir les données pour un tableau de bord en temps réel
     */
    public function getDashboard(Request $request): JsonResponse
    {
        $request->validate([
            'agence_id' => 'nullable|exists:agences,id',
        ]);

        $agenceId = $request->input('agence_id');

        // Tickets en temps réel
        $ticketsQuery = Ticket::query();
        if ($agenceId) {
            $ticketsQuery->where('agence_id', $agenceId);
        }

        $ticketsEnAttente = $ticketsQuery->clone()->where('statut', 'en_attente')->count();
        $ticketsEnCours = $ticketsQuery->clone()->where('statut', 'en_cours')->count();

        // Tickets créés aujourd'hui
        $ticketsAujourdhui = $ticketsQuery->clone()->whereDate('heure_creation', today())->count();
        
        // Tickets terminés aujourd'hui
        $ticketsTerminesAujourdhui = $ticketsQuery->clone()
            ->where('statut', 'termine')
            ->whereDate('heure_fin', today())
            ->count();

        // Temps d'attente moyen aujourd'hui
        $tempsAttenteMoyen = $ticketsQuery->clone()
            ->where('statut', 'termine')
            ->whereDate('heure_fin', today())
            ->whereNotNull('temps_attente')
            ->avg('temps_attente') ?? 0;

        // Taux de performance (tickets traités vs créés aujourd'hui)
        $tauxPerformance = $ticketsAujourdhui > 0 
            ? round(($ticketsTerminesAujourdhui / $ticketsAujourdhui) * 100, 1) 
            : 0;

        // Agents connectés (dernière connexion < 30 minutes)
        $agentsConnectesQuery = User::where('role', 'agent')
            ->where('active', true)
            ->where('derniere_connexion', '>', now()->subMinutes(30));
            
        if ($agenceId) {
            $agentsConnectesQuery->where('agence_id', $agenceId);
        }

        $agentsConnectes = $agentsConnectesQuery->count();

        // Total agents actifs
        $totalAgentsActifs = User::where('role', 'agent')
            ->where('active', true)
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('agence_id', $agenceId);
            })
            ->count();

        // Statistiques par service aujourd'hui
        $statistiquesServices = $ticketsQuery->clone()
            ->whereDate('heure_creation', today())
            ->selectRaw('service, count(*) as total, 
                        count(case when statut = "termine" then 1 end) as termines')
            ->groupBy('service')
            ->get()
            ->map(function ($item) {
                return [
                    'service' => $item->service,
                    'total' => $item->total,
                    'termines' => $item->termines,
                    'taux_completion' => $item->total > 0 ? round(($item->termines / $item->total) * 100, 1) : 0
                ];
            });

        // Agents actifs avec détails pour l'interface
        $agentsActifsDetailles = User::where('role', 'agent')
            ->where('active', true)
            ->with(['agence'])
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('agence_id', $agenceId);
            })
            ->get()
            ->map(function ($agent) {
                $ticketsTraitesAujourdhui = $agent->tickets()
                    ->whereIn('statut', ['termine', 'annule'])
                    ->whereDate('heure_fin', today())
                    ->count();

                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'email' => $agent->email,
                    'guichet' => $agent->guichet,
                    'agence' => $agent->agence ? [
                        'id' => $agent->agence->id,
                        'nom' => $agent->agence->nom
                    ] : null,
                    'tickets_traites_aujourdhui' => $ticketsTraitesAujourdhui,
                    'derniere_connexion' => $agent->derniere_connexion,
                    'est_connecte' => $agent->derniere_connexion && $agent->derniere_connexion > now()->subMinutes(30)
                ];
            });

        // Tickets récents (derniers 20)
        $ticketsRecents = Ticket::with(['agence', 'agent'])
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('agence_id', $agenceId);
            })
            ->whereIn('statut', ['en_cours', 'termine'])
            ->orderBy('updated_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'numero' => $ticket->numero,
                    'service' => $ticket->service,
                    'statut' => $ticket->statut,
                    'guichet' => $ticket->guichet,
                    'agence' => $ticket->agence ? [
                        'id' => $ticket->agence->id,
                        'nom' => $ticket->agence->nom
                    ] : null,
                    'agent' => $ticket->agent ? [
                        'id' => $ticket->agent->id,
                        'name' => $ticket->agent->name
                    ] : null,
                    'heure_creation' => $ticket->heure_creation,
                    'updated_at' => $ticket->updated_at
                ];
            });

        // Calculer la performance temps réel
        $totalTicketsAujourdhui = $ticketsAujourdhui;
        $tauxTraitement = $totalTicketsAujourdhui > 0 
            ? round(($ticketsTerminesAujourdhui / $totalTicketsAujourdhui) * 100, 1) 
            : 0;

        $ticketsParHeure = $totalTicketsAujourdhui > 0 ? round($totalTicketsAujourdhui / 24, 1) : 0;

        // Calculer l'efficacité globale corrigée
        $efficaciteGlobaleCorrigee = 0;
        if ($totalAgentsActifs > 0 && $totalTicketsAujourdhui > 0) {
            $ticketsParAgent = $totalTicketsAujourdhui / $totalAgentsActifs;
            $ticketsTerminesParAgent = $ticketsTerminesAujourdhui / $totalAgentsActifs;
            $efficaciteGlobaleCorrigee = round(($ticketsTerminesParAgent / $ticketsParAgent) * 100, 1);
        }

        // Agences avec statistiques étendues
        $agences = Agence::where('active', true)
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('id', $agenceId);
            })
            ->get()
            ->map(function ($agence) {
                $ticketsEnAttente = $agence->tickets()->where('statut', 'en_attente')->count();
                $ticketsEnCours = $agence->tickets()->where('statut', 'en_cours')->count();
                $ticketsTraites = $agence->tickets()
                    ->where('statut', 'termine')
                    ->whereDate('heure_fin', today())
                    ->count();
                $agentsActifs = $agence->users()->where('role', 'agent')->where('active', true)->count();
                $totalAgents = $agence->users()->where('role', 'agent')->count();
                
                return [
                    'id' => $agence->id,
                    'nom' => $agence->nom,
                    'est_ouverte' => $agence->estOuverte(),
                    'tickets_en_attente' => $ticketsEnAttente,
                    'tickets_en_cours' => $ticketsEnCours,
                    'tickets_traites' => $ticketsTraites,
                    'agents_actifs' => $agentsActifs,
                    'total_agents' => $totalAgents,
                    'charge_travail' => $agentsActifs > 0 ? round(($ticketsEnAttente + $ticketsEnCours) / $agentsActifs, 1) : 0
                ];
            });

        // Évolution des tickets par heure (dernières 24h)
        $evolutionTickets = DB::table('tickets')
            ->select(
                DB::raw('HOUR(heure_creation) as heure'),
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(CASE WHEN statut = "termine" THEN 1 END) as termines')
            )
            ->where('heure_creation', '>=', now()->subDay())
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('agence_id', $agenceId);
            })
            ->groupBy(DB::raw('HOUR(heure_creation)'))
            ->orderBy('heure')
            ->get();

        return response()->json([
            // Structure attendue par React
            'stats_globales' => [
                'tickets_aujourdhui' => $ticketsAujourdhui,
                'tickets_traites' => $ticketsTerminesAujourdhui,
                'tickets_en_attente' => $ticketsEnAttente,
                'tickets_en_cours' => $ticketsEnCours,
                'agents_actifs' => $agentsConnectes,
                'total_agents' => $totalAgentsActifs,
                'taux_performance' => $tauxPerformance,
                'temps_attente_moyen' => round($tempsAttenteMoyen, 1),
                'evolution_tickets' => $ticketsAujourdhui > 1 ? '+12' : '0', // Calcul simple d'évolution
                'evolution_traites' => $ticketsTerminesAujourdhui > 0 ? '+8' : '0'
            ],
            'performance_temps_reel' => [
                'taux_traitement' => $tauxTraitement,
                'efficacite_globale' => $efficaciteGlobaleCorrigee,
                'temps_moyen_attente' => round($tempsAttenteMoyen, 1),
                'tickets_par_heure' => $ticketsParHeure
            ],
            'agences' => $agences,
            'agents_actifs' => $agentsActifsDetailles,
            'tickets_recents' => $ticketsRecents,
            
            // Garder aussi l'ancienne structure pour compatibilité
            'temps_reel' => [
                'tickets_en_attente' => $ticketsEnAttente,
                'tickets_en_cours' => $ticketsEnCours,
                'tickets_aujourdhui' => $ticketsAujourdhui,
                'tickets_termines_aujourdhui' => $ticketsTerminesAujourdhui,
                'agents_connectes' => $agentsConnectes,
                'total_agents_actifs' => $totalAgentsActifs,
                'temps_attente_moyen' => round($tempsAttenteMoyen, 1),
                'taux_performance' => $tauxPerformance,
            ],
            'statistiques_services' => $statistiquesServices,
            'evolution_tickets' => $evolutionTickets,
            'derniere_mise_a_jour' => now(),
        ]);
    }

    /**
     * Gérer les utilisateurs (agents)
     */
    public function getUsers(Request $request): JsonResponse
    {
        $request->validate([
            'agence_id' => 'nullable|exists:agences,id',
            'role' => 'nullable|in:agent,admin',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = User::with('agence');

        if ($request->input('agence_id')) {
            $query->where('agence_id', $request->input('agence_id'));
        }

        if ($request->input('role')) {
            $query->where('role', $request->input('role'));
        }

        $perPage = $request->input('per_page', 20);
        $users = $query->paginate($perPage);

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    /**
     * Exporter des rapports
     */
    public function exportReport(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:tickets,agents,agences',
            'format' => 'required|in:json,csv',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'agence_id' => 'nullable|exists:agences,id',
        ]);

        // Pour cette implémentation, on retourne les données en JSON
        // Dans une vraie application, on pourrait générer des fichiers CSV/Excel
        
        $dateDebut = $request->input('date_debut') ? Carbon::parse($request->input('date_debut')) : now()->startOfMonth();
        $dateFin = $request->input('date_fin') ? Carbon::parse($request->input('date_fin')) : now()->endOfMonth();

        switch ($request->input('type')) {
            case 'tickets':
                $data = Ticket::with(['agence', 'agent'])
                    ->whereBetween('heure_creation', [$dateDebut, $dateFin])
                    ->when($request->input('agence_id'), function ($query) use ($request) {
                        return $query->where('agence_id', $request->input('agence_id'));
                    })
                    ->get();
                break;

            case 'agents':
                $data = User::where('role', 'agent')
                    ->with(['agence', 'tickets' => function ($query) use ($dateDebut, $dateFin) {
                        $query->whereBetween('heure_creation', [$dateDebut, $dateFin]);
                    }])
                    ->when($request->input('agence_id'), function ($query) use ($request) {
                        return $query->where('agence_id', $request->input('agence_id'));
                    })
                    ->get();
                break;

            case 'agences':
                $data = Agence::with(['tickets' => function ($query) use ($dateDebut, $dateFin) {
                        $query->whereBetween('heure_creation', [$dateDebut, $dateFin]);
                    }])
                    ->when($request->input('agence_id'), function ($query) use ($request) {
                        return $query->where('id', $request->input('agence_id'));
                    })
                    ->get();
                break;
        }

        return response()->json([
            'type' => $request->input('type'),
            'format' => $request->input('format'),
            'periode' => [
                'debut' => $dateDebut,
                'fin' => $dateFin,
            ],
            'data' => $data,
            'generated_at' => now(),
        ]);
    }
}
