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

echo "=== Test de la nouvelle structure API pour React ===\n\n";

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

// Debug: afficher la réponse de connexion
echo "Réponse de connexion: " . json_encode($loginResult['response'], JSON_PRETTY_PRINT) . "\n\n";

$token = $loginResult['response']['access_token'] ?? $loginResult['response']['token'] ?? null;
if (!$token) {
    echo "❌ Token non trouvé dans la réponse\n";
    exit(1);
}
echo "✅ Connexion admin réussie (Token: " . substr($token, 0, 20) . "...)\n\n";

// 2. Test du dashboard avec nouvelle structure
echo "2. Test du dashboard avec nouvelle structure...\n";
$dashboardResult = testApi($baseUrl . '/admin/dashboard', $token);

if ($dashboardResult['http_code'] !== 200) {
    echo "❌ Erreur dashboard: " . $dashboardResult['http_code'] . "\n";
    if (isset($dashboardResult['response']['message'])) {
        echo "Message: " . $dashboardResult['response']['message'] . "\n";
    }
    exit(1);
}

$data = $dashboardResult['response'];
echo "✅ Dashboard API réussie\n\n";

// 3. Vérification de la structure pour React
echo "3. Vérification de la structure attendue par React...\n\n";

// Vérifier stats_globales
if (isset($data['stats_globales'])) {
    echo "✅ stats_globales présent:\n";
    $stats = $data['stats_globales'];
    
    $expectedKeys = [
        'tickets_aujourdhui', 'tickets_traites', 'tickets_en_attente', 
        'tickets_en_cours', 'agents_actifs', 'total_agents'
    ];
    
    foreach ($expectedKeys as $key) {
        if (isset($stats[$key])) {
            echo "  ✅ $key: " . $stats[$key] . "\n";
        } else {
            echo "  ❌ $key: manquant\n";
        }
    }
    echo "\n";
} else {
    echo "❌ stats_globales manquant\n\n";
}

// Vérifier performance_temps_reel
if (isset($data['performance_temps_reel'])) {
    echo "✅ performance_temps_reel présent:\n";
    $perf = $data['performance_temps_reel'];
    
    $expectedKeys = ['taux_traitement', 'efficacite_globale', 'temps_moyen_attente', 'tickets_par_heure'];
    
    foreach ($expectedKeys as $key) {
        if (isset($perf[$key])) {
            echo "  ✅ $key: " . $perf[$key] . "\n";
        } else {
            echo "  ❌ $key: manquant\n";
        }
    }
    echo "\n";
} else {
    echo "❌ performance_temps_reel manquant\n\n";
}

// Vérifier agences avec structure étendue
if (isset($data['agences']) && is_array($data['agences'])) {
    echo "✅ agences présent (" . count($data['agences']) . " agences):\n";
    
    if (count($data['agences']) > 0) {
        $agence = $data['agences'][0];
        $expectedKeys = ['id', 'nom', 'tickets_en_attente', 'tickets_traites', 'agents_actifs', 'total_agents'];
        
        foreach ($expectedKeys as $key) {
            if (isset($agence[$key])) {
                echo "  ✅ $key: " . $agence[$key] . "\n";
            } else {
                echo "  ❌ $key: manquant\n";
            }
        }
    }
    echo "\n";
} else {
    echo "❌ agences manquant ou incorrect\n\n";
}

// Vérifier agents_actifs
if (isset($data['agents_actifs']) && is_array($data['agents_actifs'])) {
    echo "✅ agents_actifs présent (" . count($data['agents_actifs']) . " agents):\n";
    
    if (count($data['agents_actifs']) > 0) {
        $agent = $data['agents_actifs'][0];
        $expectedKeys = ['id', 'name', 'guichet', 'agence', 'tickets_traites_aujourdhui'];
        
        foreach ($expectedKeys as $key) {
            if (isset($agent[$key])) {
                $value = is_array($agent[$key]) ? json_encode($agent[$key]) : $agent[$key];
                echo "  ✅ $key: " . $value . "\n";
            } else {
                echo "  ❌ $key: manquant\n";
            }
        }
    }
    echo "\n";
} else {
    echo "❌ agents_actifs manquant ou incorrect\n\n";
}

// Vérifier tickets_recents
if (isset($data['tickets_recents']) && is_array($data['tickets_recents'])) {
    echo "✅ tickets_recents présent (" . count($data['tickets_recents']) . " tickets):\n";
    
    if (count($data['tickets_recents']) > 0) {
        $ticket = $data['tickets_recents'][0];
        $expectedKeys = ['id', 'numero', 'service', 'statut', 'agence', 'updated_at'];
        
        foreach ($expectedKeys as $key) {
            if (isset($ticket[$key])) {
                $value = is_array($ticket[$key]) ? json_encode($ticket[$key]) : $ticket[$key];
                echo "  ✅ $key: " . $value . "\n";
            } else {
                echo "  ❌ $key: manquant\n";
            }
        }
    }
    echo "\n";
} else {
    echo "❌ tickets_recents manquant ou incorrect\n\n";
}

echo "=== Exemple de données complètes ===\n";
echo "Structure JSON pour React:\n";
echo json_encode([
    'stats_globales' => $data['stats_globales'] ?? null,
    'performance_temps_reel' => $data['performance_temps_reel'] ?? null,
    'agences_count' => count($data['agences'] ?? []),
    'agents_actifs_count' => count($data['agents_actifs'] ?? []),
    'tickets_recents_count' => count($data['tickets_recents'] ?? [])
], JSON_PRETTY_PRINT);

echo "\n\n=== Test terminé ===\n";
