<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Connexion d'un agent ou administrateur
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        // Vérifier les identifiants
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        // Vérifier que l'utilisateur est actif
        if (!$user->active) {
            Auth::logout();
            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez votre administrateur.'
            ], 403);
        }

        // Mettre à jour la dernière connexion
        $user->mettreAJourDerniereConnexion();

        // Créer le token d'authentification
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'agence_id' => $user->agence_id,
                'agence' => $user->agence ? [
                    'id' => $user->agence->id,
                    'nom' => $user->agence->nom,
                    'adresse' => $user->agence->adresse,
                ] : null,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request): JsonResponse
    {
        // Supprimer le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Informations sur l'utilisateur connecté
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'agence_id' => $user->agence_id,
                'derniere_connexion' => $user->derniere_connexion,
                'agence' => $user->agence ? [
                    'id' => $user->agence->id,
                    'nom' => $user->agence->nom,
                    'adresse' => $user->agence->adresse,
                    'est_ouverte' => $user->agence->estOuverte(),
                ] : null,
            ]
        ]);
    }

    /**
     * Changement de mot de passe
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        // Vérifier l'ancien mot de passe
        if (!Hash::check($request->current_password, $user->getAuthPassword())) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        // Mettre à jour le mot de passe
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }
}
