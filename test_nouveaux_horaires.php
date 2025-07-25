<?php

require_once 'vendor/autoload.php';

// Configuration pour tester l'API
$baseUrl = 'http://localhost:8000/api';

function testApi($url, $token = null, $method = 'GET', $data = null) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => array_filter([
            'Content-Type: application/json',
            'Accept: application/json',
            $token ? "Authorization: Bearer $token" : null
        ]),
        CURLOPT_POSTFIELDS => $data ? json_encode($data) : null,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => $httpCode];
    }
    
    return [
        'http_code' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

echo "=== Test des nouveaux horaires d'ouverture des agences ===\n\n";

// Test API Agences
echo "1. Test API Agences...\n";
$agencesResult = testApi($baseUrl . '/agences');

if ($agencesResult['http_code'] === 200) {
    echo "✅ API Agences réussie\n";
    $agencesData = $agencesResult['response'];
    
    if (isset($agencesData['agences']) && is_array($agencesData['agences'])) {
        echo "\n📍 Agences avec nouveaux horaires d'ouverture:\n";
        
        foreach ($agencesData['agences'] as $agence) {
            echo "  - {$agence['nom']}\n";
            echo "    🕐 Ouverture: " . $agence['horaires']['ouverture'] . "\n";
            echo "    🕕 Fermeture: " . $agence['horaires']['fermeture'] . "\n";
            echo "    📅 Jours: " . (is_array($agence['horaires']['jours']) ? implode(', ', $agence['horaires']['jours']) : $agence['horaires']['jours']) . "\n";
            echo "    " . ($agence['est_ouverte'] ? "🟢 Actuellement OUVERTE" : "🔴 Actuellement FERMÉE") . "\n\n";
        }
        
        // Vérifier si au moins une agence a l'horaire 05:00
        $agencesA5h = array_filter($agencesData['agences'], function($agence) {
            return $agence['horaires']['ouverture'] === '05:00:00';
        });
        
        if (count($agencesA5h) > 0) {
            echo "🎉 Succès ! " . count($agencesA5h) . " agence(s) ouvrent maintenant à 05:00\n";
        } else {
            echo "⚠️  Aucune agence ne semble avoir l'horaire 05:00\n";
        }
        
    } else {
        echo "❌ Structure de données agences incorrecte\n";
    }
} else {
    echo "❌ Erreur API Agences: " . $agencesResult['http_code'] . "\n";
    if (isset($agencesResult['response']['message'])) {
        echo "Message: " . $agencesResult['response']['message'] . "\n";
    }
}

echo "\n";

// Test direct de la base de données
echo "2. Vérification directe en base de données...\n";

try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=gestion_tickets;charset=utf8mb4',
        'root',
        '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $stmt = $pdo->query("SELECT nom, heure_ouverture, heure_fermeture FROM agences ORDER BY nom");
    $agences = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✅ Connexion base de données réussie\n";
    echo "\n📊 Horaires en base de données:\n";
    
    foreach ($agences as $agence) {
        echo "  - {$agence['nom']}: {$agence['heure_ouverture']} - {$agence['heure_fermeture']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur base de données: " . $e->getMessage() . "\n";
}

echo "\n=== Test terminé ===\n";
