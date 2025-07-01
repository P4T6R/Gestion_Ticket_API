<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TicketController;
use App\Http\Controllers\API\AgentController;
use App\Http\Controllers\API\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques pour les clients (mobile, sans authentification)
Route::prefix('tickets')->group(function () {
    Route::post('/', [TicketController::class, 'create']); // Créer un ticket
    Route::get('/queue', [TicketController::class, 'queue']); // Consulter la file d'attente
    Route::get('/{numero}', [TicketController::class, 'show']); // Consulter un ticket spécifique
    Route::delete('/{numero}', [TicketController::class, 'cancel']); // Annuler un ticket
});

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    // Routes protégées par authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });
});

// Routes pour les agents (protégées par authentification + rôle agent)
Route::middleware(['auth:sanctum', App\Http\Middleware\EnsureUserIsAgent::class])
    ->prefix('agent')
    ->group(function () {
        Route::get('/queue', [AgentController::class, 'getQueue']); // File d'attente de l'agence
        Route::post('/call-next', [AgentController::class, 'callNext']); // Appeler le prochain ticket
        Route::post('/finish-current', [AgentController::class, 'finishCurrent']); // Terminer le ticket en cours
        Route::get('/history', [AgentController::class, 'getHistory']); // Historique des tickets traités
        Route::get('/stats', [AgentController::class, 'getStats']); // Statistiques de performance
    });

// Routes pour les administrateurs (protégées par authentification + rôle admin)
Route::middleware(['auth:sanctum', App\Http\Middleware\EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->group(function () {
        Route::get('/statistics', [AdminController::class, 'getStatistics']); // Statistiques globales
        Route::get('/dashboard', [AdminController::class, 'getDashboard']); // Tableau de bord temps réel
        Route::get('/users', [AdminController::class, 'getUsers']); // Gestion des utilisateurs
        Route::post('/export-report', [AdminController::class, 'exportReport']); // Export de rapports
    });

// Routes pour obtenir les informations des agences (publiques)
Route::get('/agences', function () {
    return response()->json([
        'agences' => \App\Models\Agence::where('active', true)
            ->select('id', 'nom', 'adresse', 'latitude', 'longitude', 'heure_ouverture', 'heure_fermeture', 'jours_ouverture')
            ->get()
            ->map(function ($agence) {
                return [
                    'id' => $agence->id,
                    'nom' => $agence->nom,
                    'adresse' => $agence->adresse,
                    'latitude' => $agence->latitude,
                    'longitude' => $agence->longitude,
                    'horaires' => [
                        'ouverture' => $agence->heure_ouverture,
                        'fermeture' => $agence->heure_fermeture,
                        'jours' => $agence->jours_ouverture,
                    ],
                    'est_ouverte' => $agence->estOuverte(),
                ];
            })
    ]);
});

// Route pour obtenir les services disponibles (publique)
Route::get('/services', function () {
    return response()->json([
        'services' => [
            'payement_factures' => 'Payement de factures',
            'depot_retrait' => 'Depot/Retrait',
            'transfert' => 'Transfert',
            'conseil_clientele' => 'Conseil Clientele',
        ]
    ]);
});

// Route de santé de l'API
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'version' => config('app.version', '1.0.0'),
    ]);
});

// Route de fallback pour les erreurs 404
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint non trouvé'
    ], 404);
});
