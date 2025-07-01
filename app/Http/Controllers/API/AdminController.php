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

        $periode = $request->periode ?? 'jour';
        $agenceId = $request->agence_id;

        // Définir la période
        switch ($periode) {
            case 'semaine':
                $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfWeek();
                $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfWeek();
                break;
            case 'mois':
                $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfMonth();
                $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfMonth();
                break;
            case 'annee':
                $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfYear();
                $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfYear();
                break;
            default:
                $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfDay();
                $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfDay();
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

        return response()->json([
            'periode' => [
                'type' => $periode,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ],
            'agence_filtre' => $agenceId ? Agence::find($agenceId)->nom : null,
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

        $agenceId = $request->agence_id;

        // Tickets en temps réel
        $ticketsQuery = Ticket::query();
        if ($agenceId) {
            $ticketsQuery->where('agence_id', $agenceId);
        }

        $ticketsEnAttente = $ticketsQuery->clone()->where('statut', 'en_attente')->count();
        $ticketsEnCours = $ticketsQuery->clone()->where('statut', 'en_cours')->count();

        // Tickets créés aujourd'hui
        $ticketsAujourdhui = $ticketsQuery->clone()->whereDate('heure_creation', today())->count();

        // Agents connectés (dernière connexion < 30 minutes)
        $agentsConnectesQuery = User::where('role', 'agent')
            ->where('derniere_connexion', '>', now()->subMinutes(30));
            
        if ($agenceId) {
            $agentsConnectesQuery->where('agence_id', $agenceId);
        }

        $agentsConnectes = $agentsConnectesQuery->count();

        // Agences ouvertes
        $agences = Agence::where('active', true)
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('id', $agenceId);
            })
            ->get()
            ->map(function ($agence) {
                return [
                    'id' => $agence->id,
                    'nom' => $agence->nom,
                    'est_ouverte' => $agence->estOuverte(),
                    'tickets_en_attente' => $agence->tickets()->where('statut', 'en_attente')->count(),
                    'tickets_en_cours' => $agence->tickets()->where('statut', 'en_cours')->count(),
                ];
            });

        // Évolution des tickets par heure (dernières 24h)
        $evolutionTickets = DB::table('tickets')
            ->select(
                DB::raw('HOUR(heure_creation) as heure'),
                DB::raw('COUNT(*) as total')
            )
            ->where('heure_creation', '>=', now()->subDay())
            ->when($agenceId, function ($query) use ($agenceId) {
                return $query->where('agence_id', $agenceId);
            })
            ->groupBy(DB::raw('HOUR(heure_creation)'))
            ->orderBy('heure')
            ->get();

        return response()->json([
            'temps_reel' => [
                'tickets_en_attente' => $ticketsEnAttente,
                'tickets_en_cours' => $ticketsEnCours,
                'tickets_aujourdhui' => $ticketsAujourdhui,
                'agents_connectes' => $agentsConnectes,
            ],
            'agences' => $agences,
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

        if ($request->agence_id) {
            $query->where('agence_id', $request->agence_id);
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        $perPage = $request->per_page ?? 20;
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
        
        $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfMonth();
        $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfMonth();

        switch ($request->type) {
            case 'tickets':
                $data = Ticket::with(['agence', 'agent'])
                    ->whereBetween('heure_creation', [$dateDebut, $dateFin])
                    ->when($request->agence_id, function ($query) use ($request) {
                        return $query->where('agence_id', $request->agence_id);
                    })
                    ->get();
                break;

            case 'agents':
                $data = User::where('role', 'agent')
                    ->with(['agence', 'tickets' => function ($query) use ($dateDebut, $dateFin) {
                        $query->whereBetween('heure_creation', [$dateDebut, $dateFin]);
                    }])
                    ->when($request->agence_id, function ($query) use ($request) {
                        return $query->where('agence_id', $request->agence_id);
                    })
                    ->get();
                break;

            case 'agences':
                $data = Agence::with(['tickets' => function ($query) use ($dateDebut, $dateFin) {
                        $query->whereBetween('heure_creation', [$dateDebut, $dateFin]);
                    }])
                    ->when($request->agence_id, function ($query) use ($request) {
                        return $query->where('id', $request->agence_id);
                    })
                    ->get();
                break;
        }

        return response()->json([
            'type' => $request->type,
            'format' => $request->format,
            'periode' => [
                'debut' => $dateDebut,
                'fin' => $dateFin,
            ],
            'data' => $data,
            'generated_at' => now(),
        ]);
    }
}
