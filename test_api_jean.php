<?php

require_once 'vendor/autoload.php';

// Charger l'environnement Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Simuler une requête de connexion pour Jean Dupont
$loginData = [
    'email' => 'jean.dupont@example.com',
    'password' => 'password123'
];

echo "=== TEST CONNEXION JEAN DUPONT ===\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/auth/login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Code HTTP: $httpCode\n";
echo "Réponse: $response\n";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    $token = $data['access_token'] ?? null;
    
    if ($token) {
        echo "\n=== TEST RÉCUPÉRATION QUEUE ===\n";
        
        // Tester l'endpoint /api/agent/queue
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/agent/queue');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $queueResponse = curl_exec($ch);
        $queueHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        echo "Code HTTP: $queueHttpCode\n";
        echo "Réponse Queue: $queueResponse\n";
        
        if ($queueHttpCode == 200) {
            $queueData = json_decode($queueResponse, true);
            echo "\n=== ANALYSE DONNÉES ===\n";
            echo "Tickets en attente: " . count($queueData['tickets_en_attente'] ?? []) . "\n";
            echo "Tickets en cours: " . count($queueData['tickets_en_cours'] ?? []) . "\n";
            echo "Mon ticket en cours: " . ($queueData['mon_ticket_en_cours'] ? 'OUI' : 'NON') . "\n";
        }
    }
}
