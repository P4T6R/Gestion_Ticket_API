<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Ticket;
use App\Models\Agence;

// Charger l'environnement Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICATION AGENT JEAN DUPONT ===\n";

// Récupérer l'agent Jean Dupont
$agent = User::where('email', 'jean.dupont@example.com')->with('agence')->first();

if (!$agent) {
    echo "❌ Agent Jean Dupont non trouvé\n";
    exit;
}

echo "✅ Agent trouvé:\n";
echo "   ID: {$agent->id}\n";
echo "   Nom: {$agent->name}\n";
echo "   Email: {$agent->email}\n";
echo "   Rôle: {$agent->role}\n";
echo "   Agence ID: {$agent->agence_id}\n";
echo "   Guichet: {$agent->guichet}\n";
echo "   Agence nom: " . ($agent->agence ? $agent->agence->nom : 'Aucune') . "\n";
echo "   Actif: " . ($agent->active ? 'OUI' : 'NON') . "\n";

echo "\n=== VERIFICATION AGENCE CENTRE-VILLE ===\n";
$agenceCentreVille = Agence::where('nom', 'Agence Centre-Ville')->first();

if (!$agenceCentreVille) {
    echo "❌ Agence Centre-Ville non trouvée\n";
    exit;
}

echo "✅ Agence Centre-Ville trouvée:\n";
echo "   ID: {$agenceCentreVille->id}\n";
echo "   Nom: {$agenceCentreVille->nom}\n";
echo "   Active: " . ($agenceCentreVille->active ? 'OUI' : 'NON') . "\n";

echo "\n=== TICKETS DE L'AGENCE CENTRE-VILLE ===\n";

// Vérifier tous les tickets de l'agence Centre-Ville
$tickets = Ticket::where('agence_id', $agenceCentreVille->id)->get();

echo "Total tickets dans l'agence: {$tickets->count()}\n";

if ($tickets->count() > 0) {
    foreach ($tickets as $ticket) {
        echo "   - {$ticket->numero} | {$ticket->service} | {$ticket->statut} | Créé: {$ticket->heure_creation}\n";
    }
} else {
    echo "   Aucun ticket trouvé\n";
}

echo "\n=== TICKETS EN ATTENTE POUR L'AGENT ===\n";

// Simuler ce que fait l'API AgentController::getQueue()
if (!$agent->agence_id) {
    echo "❌ Agent non assigné à une agence\n";
} else {
    // Tickets en attente
    $ticketsEnAttente = Ticket::where('agence_id', $agent->agence_id)
        ->where('statut', 'en_attente')
        ->orderBy('heure_creation')
        ->get();

    echo "Tickets en attente: {$ticketsEnAttente->count()}\n";
    
    foreach ($ticketsEnAttente as $ticket) {
        echo "   - {$ticket->numero} | {$ticket->service} | Position dans file\n";
    }

    // Tickets en cours
    $ticketsEnCours = Ticket::where('agence_id', $agent->agence_id)
        ->where('statut', 'en_cours')
        ->with('agent')
        ->get();

    echo "\nTickets en cours: {$ticketsEnCours->count()}\n";
    
    foreach ($ticketsEnCours as $ticket) {
        $agentNom = $ticket->agent ? $ticket->agent->name : 'Aucun agent';
        echo "   - {$ticket->numero} | {$ticket->service} | Agent: {$agentNom} | Guichet: {$ticket->guichet}\n";
    }
}

echo "\n=== TEST ROUTE API ===\n";
echo "Pour tester l'API avec Jean Dupont:\n";
echo "1. Connectez-vous avec : jean.dupont@example.com / password123\n";
echo "2. Utilisez le token reçu pour appeler : GET /api/agent/queue\n";
