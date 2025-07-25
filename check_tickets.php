<?php

require_once 'vendor/autoload.php';

use App\Models\Ticket;

// Charger l'environnement Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TICKETS EXISTANTS ===\n";
$tickets = Ticket::select('id', 'numero', 'service', 'agence_id')->get();

if ($tickets->isEmpty()) {
    echo "Aucun ticket trouvé.\n";
} else {
    foreach ($tickets as $ticket) {
        echo "ID: {$ticket->id} - Numéro: {$ticket->numero} - Service: {$ticket->service} - Agence: {$ticket->agence_id}\n";
    }
}

echo "\n=== TEST GENERATION NUMERO ===\n";
try {
    $nouveauNumero = Ticket::genererNumero(3, 'payement_factures');
    echo "Nouveau numéro généré: $nouveauNumero\n";
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
