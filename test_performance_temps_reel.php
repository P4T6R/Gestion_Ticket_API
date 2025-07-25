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

echo "=== Test spécifique Performance Temps Réel Dashboard ===\n\n";

// 1. Connexion admin
echo "1. Connexion admin...\n";
$loginResult = testApi($baseUrl . '/auth/login', null, 'POST', [
    'email' => 'admin@example.com',
    'password' => 'password123'
]);

if ($loginResult['http_code'] !== 200) {
    echo "❌ Erreur de connexion: " . $loginResult['http_code'] . "\n";
    exit(1);
}

$token = $loginResult['response']['token'];
echo "✅ Connexion admin réussie\n\n";

// 2. Test API Dashboard avec focus sur performance_temps_reel
echo "2. Test API Dashboard - Focus Performance Temps Réel...\n";
$dashboardResult = testApi($baseUrl . '/admin/dashboard', $token);

if ($dashboardResult['http_code'] !== 200) {
    echo "❌ Dashboard API erreur: " . $dashboardResult['http_code'] . "\n";
    if (isset($dashboardResult['response']['message'])) {
        echo "Message: " . $dashboardResult['response']['message'] . "\n";
    }
    exit(1);
}

$data = $dashboardResult['response'];
echo "✅ Dashboard API réussie\n\n";

// 3. Vérification spécifique de performance_temps_reel
echo "3. Vérification détaillée de performance_temps_reel...\n";

if (isset($data['performance_temps_reel'])) {
    echo "✅ performance_temps_reel présent !\n";
    $perf = $data['performance_temps_reel'];
    
    echo "  📊 Données détaillées:\n";
    echo "    ✅ taux_traitement: " . ($perf['taux_traitement'] ?? 'manquant') . "%\n";
    echo "    ✅ efficacite_globale: " . ($perf['efficacite_globale'] ?? 'manquant') . "%\n";
    echo "    ✅ temps_moyen_attente: " . ($perf['temps_moyen_attente'] ?? 'manquant') . " min\n";
    echo "    ✅ tickets_par_heure: " . ($perf['tickets_par_heure'] ?? 'manquant') . " tickets/h\n";
    
    echo "\n  🎯 Structure JSON pour React:\n";
    echo "  ```json\n";
    echo "  " . json_encode($perf, JSON_PRETTY_PRINT) . "\n";
    echo "  ```\n";
    
} else {
    echo "❌ performance_temps_reel manquant dans la réponse!\n";
    echo "Clés disponibles: " . implode(', ', array_keys($data)) . "\n";
}

echo "\n";

// 4. Vérification de la cohérence des autres données
echo "4. Vérification de la cohérence des autres données...\n";

if (isset($data['stats_globales'])) {
    echo "✅ stats_globales présent\n";
    $stats = $data['stats_globales'];
    echo "  - tickets_aujourdhui: " . ($stats['tickets_aujourdhui'] ?? 'manquant') . "\n";
    echo "  - tickets_traites: " . ($stats['tickets_traites'] ?? 'manquant') . "\n";
    echo "  - agents_actifs: " . ($stats['agents_actifs'] ?? 'manquant') . "\n";
} else {
    echo "❌ stats_globales manquant\n";
}

if (isset($data['agences'])) {
    echo "✅ agences présent (" . count($data['agences']) . " agences)\n";
} else {
    echo "❌ agences manquant\n";
}

if (isset($data['agents_actifs'])) {
    echo "✅ agents_actifs présent (" . count($data['agents_actifs']) . " agents)\n";
} else {
    echo "❌ agents_actifs manquant\n";
}

if (isset($data['tickets_recents'])) {
    echo "✅ tickets_recents présent (" . count($data['tickets_recents']) . " tickets)\n";
} else {
    echo "❌ tickets_recents manquant\n";
}

echo "\n";

// 5. Test React component compatibility
echo "5. Test de compatibilité React AdminDashboard...\n";

$reactCompatible = true;
$requiredKeys = [
    'stats_globales' => ['tickets_aujourdhui', 'tickets_traites', 'agents_actifs'],
    'performance_temps_reel' => ['taux_traitement', 'efficacite_globale', 'temps_moyen_attente', 'tickets_par_heure'],
    'agences' => [],
    'agents_actifs' => [],
    'tickets_recents' => []
];

foreach ($requiredKeys as $mainKey => $subKeys) {
    if (!isset($data[$mainKey])) {
        echo "❌ Clé manquante: $mainKey\n";
        $reactCompatible = false;
        continue;
    }
    
    if (is_array($subKeys) && count($subKeys) > 0) {
        foreach ($subKeys as $subKey) {
            if (!isset($data[$mainKey][$subKey])) {
                echo "❌ Sous-clé manquante: $mainKey.$subKey\n";
                $reactCompatible = false;
            }
        }
    }
}

if ($reactCompatible) {
    echo "🎉 L'API est 100% compatible avec AdminDashboard.js !\n";
    echo "\n📝 Code React pour récupérer performance_temps_reel:\n";
    echo "```javascript\n";
    echo "const { performance_temps_reel } = dashboardData;\n";
    echo "console.log('Taux traitement:', performance_temps_reel.taux_traitement);\n";
    echo "console.log('Efficacité globale:', performance_temps_reel.efficacite_globale);\n";
    echo "```\n";
} else {
    echo "❌ L'API n'est pas entièrement compatible avec React\n";
}

echo "\n=== Test terminé ===\n";
