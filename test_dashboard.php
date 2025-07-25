<?php

require_once 'vendor/autoload.php';

// Charger l'environnement Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST API DASHBOARD ADMIN ===\n";

// Simuler une requête dashboard
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/dashboard');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer 1|test', // Token factice pour le test
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

echo "Test direct sans token (pour vérifier la structure)...\n";

// Test direct de la logique
use App\Models\Ticket;
use App\Models\User;
use App\Models\Agence;
use Illuminate\Support\Facades\DB;

$ticketsEnAttente = Ticket::where('statut', 'en_attente')->count();
$ticketsEnCours = Ticket::where('statut', 'en_cours')->count();
$ticketsAujourdhui = Ticket::whereDate('heure_creation', today())->count();
$ticketsTerminesAujourdhui = Ticket::where('statut', 'termine')
    ->whereDate('heure_fin', today())
    ->count();

echo "Statistiques calculées:\n";
echo "- Tickets en attente: $ticketsEnAttente\n";
echo "- Tickets en cours: $ticketsEnCours\n";
echo "- Tickets aujourd'hui: $ticketsAujourdhui\n";
echo "- Tickets terminés aujourd'hui: $ticketsTerminesAujourdhui\n";

$agentsActifs = User::where('role', 'agent')->where('active', true)->count();
echo "- Agents actifs: $agentsActifs\n";

$agences = Agence::where('active', true)->get();
echo "- Agences actives: " . $agences->count() . "\n";

foreach ($agences as $agence) {
    $attente = $agence->tickets()->where('statut', 'en_attente')->count();
    $cours = $agence->tickets()->where('statut', 'en_cours')->count();
    echo "  * {$agence->nom}: {$attente} en attente, {$cours} en cours\n";
}

echo "\n=== STRUCTURE ATTENDUE PAR REACT ===\n";
echo "Le dashboard admin React attend probablement:\n";
echo "- temps_reel.tickets_en_attente\n";
echo "- temps_reel.tickets_en_cours\n";
echo "- temps_reel.tickets_aujourdhui\n";
echo "- temps_reel.taux_performance\n";
echo "- agences[].tickets_en_attente\n";
echo "- agences[].tickets_en_cours\n";
