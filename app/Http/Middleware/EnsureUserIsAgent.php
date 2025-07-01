<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAgent
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier que l'utilisateur est connecté
        if (!$request->user()) {
            return response()->json([
                'message' => 'Non authentifié'
            ], 401);
        }

        // Vérifier que l'utilisateur est un agent ou un admin
        if (!in_array($request->user()->role, ['agent', 'admin'])) {
            return response()->json([
                'message' => 'Accès refusé. Seuls les agents et administrateurs peuvent accéder à cette ressource.'
            ], 403);
        }

        // Vérifier que l'utilisateur est actif
        if (!$request->user()->active) {
            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez votre administrateur.'
            ], 403);
        }

        return $next($request);
    }
}
