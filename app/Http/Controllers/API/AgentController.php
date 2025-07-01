<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;

class AgentController extends Controller
{
    /**
     * Obtenir les tickets en file d'attente pour l'agence de l'agent
     */
    public function getQueue(Request $request): JsonResponse
    {
        /** @var User $agent */
        $agent = $request->user();

        if (!$agent->agence_id) {
            return response()->json([
                'message' => 'Agent non assigné à une agence'
            ], 422);
        }

        // Tickets en attente
        $ticketsEnAttente = Ticket::where('agence_id', $agent->agence_id)
            ->where('statut', 'en_attente')
            ->orderBy('heure_creation')
            ->get();

        // Tickets en cours dans l'agence
        $ticketsEnCours = Ticket::where('agence_id', $agent->agence_id)
            ->where('statut', 'en_cours')
            ->with('agent')
            ->get();

        // Ticket en cours de cet agent
        $monTicketEnCours = $agent->getTicketEnCours();

        return response()->json([
            'tickets_en_attente' => $ticketsEnAttente->map(function ($ticket, $index) {
                return [
                    'id' => $ticket->id,
                    'numero' => $ticket->numero,
                    'service' => $ticket->service,
                    'heure_creation' => $ticket->heure_creation,
                    'temps_attente' => Carbon::parse($ticket->heure_creation)->diffInMinutes(now()),
                    'position' => $index + 1,
                ];
            }),
            'tickets_en_cours' => $ticketsEnCours->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'numero' => $ticket->numero,
                    'service' => $ticket->service,
                    'agent' => $ticket->agent->name,
                    'guichet' => $ticket->guichet,
                    'heure_appel' => $ticket->heure_appel,
                    'duree_traitement' => Carbon::parse($ticket->heure_appel)->diffInMinutes(now()),
                ];
            }),
            'mon_ticket_en_cours' => $monTicketEnCours ? [
                'id' => $monTicketEnCours->id,
                'numero' => $monTicketEnCours->numero,
                'service' => $monTicketEnCours->service,
                'guichet' => $monTicketEnCours->guichet,
                'heure_appel' => $monTicketEnCours->heure_appel,
                'duree_traitement' => Carbon::parse($monTicketEnCours->heure_appel)->diffInMinutes(now()),
            ] : null,
            'statistiques' => [
                'total_en_attente' => $ticketsEnAttente->count(),
                'total_en_cours' => $ticketsEnCours->count(),
                'temps_attente_moyen' => $ticketsEnAttente->count() * 5, // 5 min par ticket
            ]
        ]);
    }

    /**
     * Appeler le prochain ticket
     */
    public function callNext(Request $request): JsonResponse
    {
        /** @var User $agent */
        $agent = $request->user();

        if (!$agent->agence_id) {
            return response()->json([
                'message' => 'Agent non assigné à une agence'
            ], 422);
        }

        // Vérifier que l'agent n'a pas déjà un ticket en cours
        if ($agent->getTicketEnCours()) {
            return response()->json([
                'message' => 'Vous avez déjà un ticket en cours de traitement'
            ], 422);
        }

        // Récupérer le premier ticket en attente
        $ticket = Ticket::where('agence_id', $agent->agence_id)
            ->where('statut', 'en_attente')
            ->orderBy('heure_creation')
            ->first();

        if (!$ticket) {
            return response()->json([
                'message' => 'Aucun ticket en attente'
            ], 404);
        }

        // Appeler le ticket
        $success = $ticket->appeler($agent);

        if (!$success) {
            return response()->json([
                'message' => 'Impossible d\'appeler ce ticket'
            ], 422);
        }

        return response()->json([
            'message' => 'Ticket appelé avec succès',
            'ticket' => [
                'id' => $ticket->id,
                'numero' => $ticket->numero,
                'service' => $ticket->service,
                'statut' => $ticket->statut,
                'heure_appel' => $ticket->heure_appel,
                'temps_attente' => $ticket->temps_attente,
                'guichet' => $ticket->guichet,
            ],
            'message_affichage' => $agent->guichet 
                ? "Le numéro {$ticket->numero} est appelé au guichet {$agent->guichet}"
                : "Le numéro {$ticket->numero} est appelé"
        ]);
    }

    /**
     * Terminer le ticket en cours
     */
    public function finishCurrent(Request $request): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        /** @var User $agent */
        $agent = $request->user();

        $ticket = $agent->getTicketEnCours();

        if (!$ticket) {
            return response()->json([
                'message' => 'Aucun ticket en cours'
            ], 404);
        }

        // Terminer le ticket
        $success = $ticket->terminer($request->notes);

        if (!$success) {
            return response()->json([
                'message' => 'Impossible de terminer ce ticket'
            ], 422);
        }

        $dureeTraitement = Carbon::parse($ticket->heure_appel)->diffInMinutes($ticket->heure_fin);

        return response()->json([
            'message' => 'Ticket terminé avec succès',
            'ticket' => [
                'id' => $ticket->id,
                'numero' => $ticket->numero,
                'service' => $ticket->service,
                'statut' => $ticket->statut,
                'heure_fin' => $ticket->heure_fin,
                'duree_traitement' => $dureeTraitement,
                'notes' => $ticket->notes,
            ]
        ]);
    }

    /**
     * Obtenir l'historique des tickets traités par l'agent
     */
    public function getHistory(Request $request): JsonResponse
    {
        $request->validate([
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        /** @var User $agent */
        $agent = $request->user();

        $query = $agent->tickets()
            ->whereIn('statut', ['termine', 'annule'])
            ->orderBy('heure_creation', 'desc');

        // Filtrer par période si spécifiée
        if ($request->date_debut) {
            $query->whereDate('heure_creation', '>=', $request->date_debut);
        }

        if ($request->date_fin) {
            $query->whereDate('heure_creation', '<=', $request->date_fin);
        }

        $perPage = $request->per_page ?? 20;
        $tickets = $query->paginate($perPage);

        return response()->json([
            'tickets' => $tickets->items(),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
                'total' => $tickets->total(),
            ],
            'statistiques' => [
                'total_traites' => $agent->tickets()->whereIn('statut', ['termine', 'annule'])->count(),
                'total_termines' => $agent->tickets()->where('statut', 'termine')->count(),
                'total_annules' => $agent->tickets()->where('statut', 'annule')->count(),
            ]
        ]);
    }

    /**
     * Obtenir les statistiques de performance de l'agent
     */
    public function getStats(Request $request): JsonResponse
    {
        $request->validate([
            'periode' => 'nullable|in:jour,semaine,mois',
        ]);

        /** @var User $agent */
        $agent = $request->user();

        $periode = $request->periode ?? 'jour';
        
        // Définir la période
        switch ($periode) {
            case 'semaine':
                $dateDebut = now()->startOfWeek();
                break;
            case 'mois':
                $dateDebut = now()->startOfMonth();
                break;
            default:
                $dateDebut = now()->startOfDay();
                break;
        }

        $tickets = $agent->tickets()
            ->where('heure_creation', '>=', $dateDebut)
            ->get();

        $ticketsTermines = $tickets->where('statut', 'termine');
        $tempsMoyenTraitement = $ticketsTermines->avg(function ($ticket) {
            if ($ticket->heure_appel && $ticket->heure_fin) {
                return Carbon::parse($ticket->heure_appel)->diffInMinutes($ticket->heure_fin);
            }
            return null;
        });

        return response()->json([
            'periode' => $periode,
            'date_debut' => $dateDebut,
            'statistiques' => [
                'tickets_traites' => $tickets->whereIn('statut', ['termine', 'annule'])->count(),
                'tickets_termines' => $ticketsTermines->count(),
                'tickets_annules' => $tickets->where('statut', 'annule')->count(),
                'temps_moyen_traitement' => round($tempsMoyenTraitement, 2),
                'ticket_en_cours' => $agent->getTicketEnCours() ? 1 : 0,
            ]
        ]);
    }
}
