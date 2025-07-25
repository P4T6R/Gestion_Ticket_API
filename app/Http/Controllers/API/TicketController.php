<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Ticket;
use App\Models\Agence;
use Carbon\Carbon;

class TicketController extends Controller
{
    /**
     * Créer un nouveau ticket (pour les clients mobile)
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'service' => 'required|string|in:payement_factures,depot_retrait,transfert,conseil_clientele',
            'agence_id' => 'required|exists:agences,id',
            'client_latitude' => 'nullable|numeric|between:-90,90',
            'client_longitude' => 'nullable|numeric|between:-180,180',
        ]);

        // Vérifier que l'agence est ouverte
        $agence = Agence::findOrFail($request->input('agence_id'));
        
        if (!$agence->estOuverte()) {
            return response()->json([
                'message' => 'L\'agence est fermée. Veuillez revenir pendant les heures d\'ouverture.',
                'horaires' => [
                    'ouverture' => $agence->heure_ouverture,
                    'fermeture' => $agence->heure_fermeture,
                    'jours_ouverture' => $agence->jours_ouverture ?? [],
                ]
            ], 422);
        }

        // Générer le numéro de ticket
        $numeroTicket = Ticket::genererNumero($request->input('agence_id'), $request->input('service'));

        // Créer le ticket
        $ticket = Ticket::create([
            'numero' => $numeroTicket,
            'service' => $request->input('service'),
            'agence_id' => $request->input('agence_id'),
            'client_latitude' => $request->input('client_latitude'),
            'client_longitude' => $request->input('client_longitude'),
            'heure_creation' => now(),
        ]);

        // Calculer les informations de file d'attente
        $positionDansLaFile = $ticket->getPositionDansLaFile();
        $tempsAttenteEstime = $ticket->getTempsAttenteEstime();

        return response()->json([
            'message' => 'Ticket créé avec succès',
            'ticket' => [
                'id' => $ticket->id,
                'numero' => $ticket->numero,
                'service' => $ticket->service,
                'statut' => $ticket->statut,
                'heure_creation' => $ticket->heure_creation,
                'position_file' => $positionDansLaFile,
                'temps_attente_estime' => $tempsAttenteEstime,
                'agence' => [
                    'nom' => $agence->nom,
                    'adresse' => $agence->adresse,
                ]
            ]
        ], 201);
    }

    /**
     * Consulter l'état de la file d'attente
     */
    public function queue(Request $request): JsonResponse
    {
        $request->validate([
            'agence_id' => 'required|exists:agences,id',
            'service' => 'nullable|string|in:payement_factures,depot_retrait,transfert,conseil_clientele',
        ]);

        $query = Ticket::where('agence_id', $request->input('agence_id'))
            ->where('statut', 'en_attente')
            ->orderBy('heure_creation');

        if ($request->input('service')) {
            $query->where('service', $request->input('service'));
        }

        $tickets = $query->with('agence')->get();

        // Calculer les statistiques de la file
        $totalEnAttente = $tickets->count();
        $tempsAttenteMoyen = $totalEnAttente > 0 ? ($totalEnAttente * 5) : 0; // 5 min par ticket

        // Tickets actuellement en cours
        $ticketsEnCours = Ticket::where('agence_id', $request->input('agence_id'))
            ->where('statut', 'en_cours')
            ->with(['agent'])
            ->get();

        return response()->json([
            'file_attente' => [
                'total_en_attente' => $totalEnAttente,
                'temps_attente_moyen' => $tempsAttenteMoyen,
                'tickets_en_cours' => $ticketsEnCours->count(),
                'tickets' => $tickets->map(function ($ticket, $index) {
                    return [
                        'numero' => $ticket->numero,
                        'service' => $ticket->service,
                        'position' => $index + 1,
                        'temps_attente_estime' => ($index + 1) * 5,
                        'heure_creation' => $ticket->heure_creation,
                    ];
                })
            ],
            'tickets_en_cours' => $ticketsEnCours->map(function ($ticket) {
                return [
                    'numero' => $ticket->numero,
                    'service' => $ticket->service,
                    'agent' => $ticket->agent ? $ticket->agent->name : null,
                    'guichet' => $ticket->guichet,
                    'heure_appel' => $ticket->heure_appel,
                    'message_affichage' => $ticket->guichet 
                        ? "Le numéro {$ticket->numero} est appelé au guichet {$ticket->guichet}"
                        : "Le numéro {$ticket->numero} est appelé"
                ];
            })
        ]);
    }

    /**
     * Consulter un ticket spécifique (pour les clients)
     */
    public function show(Request $request, string $numero): JsonResponse
    {
        $request->validate([
            'agence_id' => 'required|exists:agences,id',
        ]);

        $ticket = Ticket::where('numero', $numero)
            ->where('agence_id', $request->input('agence_id'))
            ->with(['agence', 'agent'])
            ->first();

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket non trouvé'
            ], 404);
        }

        $response = [
            'ticket' => [
                'id' => $ticket->id,
                'numero' => $ticket->numero,
                'service' => $ticket->service,
                'statut' => $ticket->statut,
                'guichet' => $ticket->guichet,
                'heure_creation' => $ticket->heure_creation,
                'heure_appel' => $ticket->heure_appel,
                'heure_fin' => $ticket->heure_fin,
                'temps_attente' => $ticket->temps_attente,
                'agence' => [
                    'nom' => $ticket->agence->nom,
                    'adresse' => $ticket->agence->adresse,
                ]
            ]
        ];

        // Ajouter des informations spécifiques selon le statut
        switch ($ticket->statut) {
            case 'en_attente':
                $response['ticket']['position_file'] = $ticket->getPositionDansLaFile();
                $response['ticket']['temps_attente_estime'] = $ticket->getTempsAttenteEstime();
                break;
                
            case 'en_cours':
                $response['ticket']['agent'] = $ticket->agent ? $ticket->agent->name : null;
                $response['ticket']['message_affichage'] = $ticket->guichet 
                    ? "Le numéro {$ticket->numero} est appelé au guichet {$ticket->guichet}"
                    : "Le numéro {$ticket->numero} est appelé";
                break;
                
            case 'termine':
                $response['ticket']['agent'] = $ticket->agent ? $ticket->agent->name : null;
                $response['ticket']['duree_traitement'] = $ticket->heure_appel && $ticket->heure_fin 
                    ? Carbon::parse($ticket->heure_appel)->diffInMinutes($ticket->heure_fin)
                    : null;
                break;
        }

        return response()->json($response);
    }

    /**
     * Annuler un ticket (optionnel pour les clients)
     */
    public function cancel(Request $request, string $numero): JsonResponse
    {
        $request->validate([
            'agence_id' => 'required|exists:agences,id',
        ]);

        $ticket = Ticket::where('numero', $numero)
            ->where('agence_id', $request->input('agence_id'))
            ->where('statut', 'en_attente')
            ->first();

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket non trouvé ou ne peut pas être annulé'
            ], 404);
        }

        $ticket->update(['statut' => 'annule']);

        // Enregistrer dans les logs
        $ticket->distributionLogs()->create([
            'agent_id' => null,
            'agence_id' => $ticket->agence_id,
            'action' => 'annulation',
            'horodatage' => now(),
            'commentaire' => 'Ticket annulé par le client'
        ]);

        return response()->json([
            'message' => 'Ticket annulé avec succès'
        ]);
    }
}
