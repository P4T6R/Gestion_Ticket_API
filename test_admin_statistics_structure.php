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

echo "=== Test de l'API Statistics pour React AdminStatistics ===\n\n";

// 1. Connexion admin
echo "1. Connexion admin...\n";
$loginResult = testApi($baseUrl . '/auth/login', null, 'POST', [
    'email' => 'admin@example.com',
    'password' => 'password123'
]);

if ($loginResult['http_code'] !== 200) {
    echo "❌ Erreur de connexion: " . $loginResult['http_code'] . "\n";
    if (isset($loginResult['response']['message'])) {
        echo "Message: " . $loginResult['response']['message'] . "\n";
    }
    exit(1);
}

$token = $loginResult['response']['token'];
echo "✅ Connexion admin réussie\n\n";

// 2. Test des statistiques avec différentes périodes
$periodes = [
    'jour' => 'Aujourd\'hui',
    'semaine' => 'Cette semaine',
    'mois' => 'Ce mois'
];

foreach ($periodes as $periode => $libelle) {
    echo "2. Test des statistiques - $libelle...\n";
    $statsResult = testApi($baseUrl . '/admin/statistics?periode=' . $periode, $token);

    if ($statsResult['http_code'] !== 200) {
        echo "❌ Erreur statistics: " . $statsResult['http_code'] . "\n";
        continue;
    }

    $data = $statsResult['response'];
    echo "✅ Statistics API réussie pour $libelle\n";

    // Vérification de la structure pour React AdminStatistics
    echo "  Vérification de la structure...\n";

    // Vérifier stats_generales
    if (isset($data['stats_generales'])) {
        echo "  ✅ stats_generales présent:\n";
        $stats = $data['stats_generales'];
        
        $expectedKeys = [
            'total_tickets', 'temps_moyen', 'taux_satisfaction', 'agents_actifs', 'total_agents'
        ];
        
        foreach ($expectedKeys as $key) {
            if (isset($stats[$key])) {
                echo "    ✅ $key: " . $stats[$key] . "\n";
            } else {
                echo "    ❌ $key: manquant\n";
            }
        }
    } else {
        echo "  ❌ stats_generales manquant\n";
    }

    // Vérifier repartition_services
    if (isset($data['repartition_services']) && is_array($data['repartition_services'])) {
        echo "  ✅ repartition_services présent (" . count($data['repartition_services']) . " services)\n";
        
        if (count($data['repartition_services']) > 0) {
            $service = $data['repartition_services'][0];
            $expectedKeys = ['name', 'value', 'termines'];
            
            foreach ($expectedKeys as $key) {
                if (isset($service[$key])) {
                    echo "    ✅ $key: " . $service[$key] . "\n";
                } else {
                    echo "    ❌ $key: manquant\n";
                }
            }
        }
    } else {
        echo "  ❌ repartition_services manquant ou incorrect\n";
    }

    // Vérifier performance_agences
    if (isset($data['performance_agences']) && is_array($data['performance_agences'])) {
        echo "  ✅ performance_agences présent (" . count($data['performance_agences']) . " agences)\n";
        
        if (count($data['performance_agences']) > 0) {
            $agence = $data['performance_agences'][0];
            $expectedKeys = ['nom', 'tickets_traites', 'temps_moyen'];
            
            foreach ($expectedKeys as $key) {
                if (isset($agence[$key])) {
                    echo "    ✅ $key: " . $agence[$key] . "\n";
                } else {
                    echo "    ❌ $key: manquant\n";
                }
            }
        }
    } else {
        echo "  ❌ performance_agences manquant ou incorrect\n";
    }

    // Vérifier evolution_temporelle
    if (isset($data['evolution_temporelle']) && is_array($data['evolution_temporelle'])) {
        echo "  ✅ evolution_temporelle présent (" . count($data['evolution_temporelle']) . " points)\n";
    } else {
        echo "  ❌ evolution_temporelle manquant ou incorrect\n";
    }

    // Vérifier top_agents
    if (isset($data['top_agents']) && is_array($data['top_agents'])) {
        echo "  ✅ top_agents présent (" . count($data['top_agents']) . " agents)\n";
        
        if (count($data['top_agents']) > 0) {
            $agent = $data['top_agents'][0];
            $expectedKeys = ['id', 'name', 'tickets_traites', 'temps_moyen', 'performance'];
            
            foreach ($expectedKeys as $key) {
                if (isset($agent[$key])) {
                    echo "    ✅ $key: " . $agent[$key] . "\n";
                } else {
                    echo "    ❌ $key: manquant\n";
                }
            }
        }
    } else {
        echo "  ❌ top_agents manquant ou incorrect\n";
    }

    // Vérifier temps_attente
    if (isset($data['temps_attente'])) {
        echo "  ✅ temps_attente présent:\n";
        $temps = $data['temps_attente'];
        
        $expectedKeys = ['moyen', 'maximum', 'moins_5min', 'entre_5_15min', 'plus_15min'];
        
        foreach ($expectedKeys as $key) {
            if (isset($temps[$key])) {
                echo "    ✅ $key: " . $temps[$key] . "\n";
            } else {
                echo "    ❌ $key: manquant\n";
            }
        }
    } else {
        echo "  ❌ temps_attente manquant\n";
    }

    echo "\n";
}

// 3. Test avec filtre agence
echo "3. Test avec filtre agence...\n";
$statsAgenceResult = testApi($baseUrl . '/admin/statistics?periode=mois&agence_id=1', $token);

if ($statsAgenceResult['http_code'] === 200) {
    echo "✅ Statistics avec filtre agence réussie\n";
    $agenceData = $statsAgenceResult['response'];
    echo "  Agence filtrée: " . ($agenceData['agence_filtre'] ?? 'Non spécifiée') . "\n";
} else {
    echo "❌ Erreur statistics avec agence: " . $statsAgenceResult['http_code'] . "\n";
}

echo "\n=== Exemple de structure JSON pour React ===\n";
if (isset($data)) {
    echo json_encode([
        'stats_generales' => $data['stats_generales'] ?? null,
        'repartition_services_count' => count($data['repartition_services'] ?? []),
        'performance_agences_count' => count($data['performance_agences'] ?? []),
        'evolution_temporelle_count' => count($data['evolution_temporelle'] ?? []),
        'top_agents_count' => count($data['top_agents'] ?? []),
        'temps_attente' => $data['temps_attente'] ?? null
    ], JSON_PRETTY_PRINT);
}

echo "\n\n=== Test terminé ===\n";
