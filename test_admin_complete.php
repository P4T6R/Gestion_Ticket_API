<?php

echo "=== TEST COMPLET API DASHBOARD ===\n";

// Test connexion admin
$loginData = [
    'email' => 'admin@example.com',
    'password' => 'password123'
];

echo "1. Connexion admin...\n";
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

echo "Code HTTP connexion: $httpCode\n";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    $token = $data['token'] ?? null;
    
    if ($token) {
        echo "✅ Token obtenu\n";
        echo "2. Test dashboard admin...\n";
        
        // Test dashboard
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/dashboard');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $dashboardResponse = curl_exec($ch);
        $dashboardHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        echo "Code HTTP dashboard: $dashboardHttpCode\n";
        
        if ($dashboardHttpCode == 200) {
            $dashboardData = json_decode($dashboardResponse, true);
            echo "✅ Dashboard récupéré\n";
            echo "Structure reçue:\n";
            
            if (isset($dashboardData['temps_reel'])) {
                echo "- temps_reel:\n";
                foreach ($dashboardData['temps_reel'] as $key => $value) {
                    echo "  * $key: $value\n";
                }
            }
            
            if (isset($dashboardData['agences'])) {
                echo "- agences: " . count($dashboardData['agences']) . " trouvées\n";
                foreach ($dashboardData['agences'] as $agence) {
                    echo "  * {$agence['nom']}: {$agence['tickets_en_attente']} en attente, {$agence['tickets_en_cours']} en cours\n";
                }
            }
            
            if (isset($dashboardData['statistiques_services'])) {
                echo "- services: " . count($dashboardData['statistiques_services']) . " trouvés\n";
                foreach ($dashboardData['statistiques_services'] as $service) {
                    echo "  * {$service['service']}: {$service['total']} total, {$service['termines']} terminés\n";
                }
            }
            
        } else {
            echo "❌ Erreur dashboard: $dashboardResponse\n";
        }
    } else {
        echo "❌ Pas de token dans la réponse\n";
    }
} else {
    echo "❌ Erreur connexion: $response\n";
}
