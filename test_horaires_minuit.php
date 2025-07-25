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

echo "=== Test des horaires d'ouverture à 00:00 (minuit) ===\n\n";

// Test API Agences
echo "1. Test API Agences avec nouveaux horaires 00:00...\n";
$agencesResult = testApi($baseUrl . '/agences');

if ($agencesResult['http_code'] === 200) {
    echo "✅ API Agences réussie\n";
    $agencesData = $agencesResult['response'];
    
    if (isset($agencesData['agences']) && is_array($agencesData['agences'])) {
        echo "\n🌙 Agences ouvertes 24h/24 (à partir de 00:00):\n";
        
        $agencesMinuit = 0;
        
        foreach ($agencesData['agences'] as $agence) {
            echo "  - {$agence['nom']}\n";
            echo "    🕛 Ouverture: " . $agence['horaires']['ouverture'] . "\n";
            echo "    🕕 Fermeture: " . $agence['horaires']['fermeture'] . "\n";
            echo "    📅 Jours: " . (is_array($agence['horaires']['jours']) ? implode(', ', $agence['horaires']['jours']) : $agence['horaires']['jours']) . "\n";
            echo "    " . ($agence['est_ouverte'] ? "🟢 Actuellement OUVERTE" : "🔴 Actuellement FERMÉE") . "\n";
            
            // Vérifier si l'agence ouvre à minuit
            if ($agence['horaires']['ouverture'] === '00:00:00') {
                $agencesMinuit++;
                echo "    ✨ Service 24h/24 depuis minuit !\n";
            }
            echo "\n";
        }
        
        if ($agencesMinuit > 0) {
            echo "🎉 Succès ! {$agencesMinuit} agence(s) ouvrent maintenant à 00:00 (minuit)\n";
            echo "🌟 Service disponible 24h/24 !\n";
        } else {
            echo "⚠️  Aucune agence ne semble avoir l'horaire 00:00\n";
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
    
    $stmt = $pdo->query("SELECT nom, heure_ouverture, heure_fermeture, active FROM agences ORDER BY nom");
    $agences = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✅ Connexion base de données réussie\n";
    echo "\n📊 Horaires en base de données:\n";
    
    $countMinuit = 0;
    foreach ($agences as $agence) {
        $status = $agence['active'] ? '🟢' : '🔴';
        echo "  {$status} {$agence['nom']}: {$agence['heure_ouverture']} - {$agence['heure_fermeture']}\n";
        
        if ($agence['heure_ouverture'] === '00:00:00') {
            $countMinuit++;
        }
    }
    
    echo "\n📈 Résumé:\n";
    echo "  - Total agences: " . count($agences) . "\n";
    echo "  - Agences ouvertes à 00:00: {$countMinuit}\n";
    echo "  - Service 24h/24 disponible: " . ($countMinuit > 0 ? "✅ OUI" : "❌ NON") . "\n";
    
} catch (Exception $e) {
    echo "❌ Erreur base de données: " . $e->getMessage() . "\n";
}

// Test de l'heure actuelle pour voir si les agences sont considérées ouvertes
echo "\n3. Test du statut d'ouverture actuel...\n";
echo "🕐 Heure actuelle: " . date('H:i:s') . "\n";
echo "📅 Date actuelle: " . date('Y-m-d (l)') . "\n";

echo "\n=== Test terminé ===\n";
