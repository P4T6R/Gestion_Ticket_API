<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Agence;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer les agences
        $agenceCentreVille = Agence::where('nom', 'Agence Centre-Ville')->first();
        $agenceNord = Agence::where('nom', 'Agence Nord')->first();
        $agenceSud = Agence::where('nom', 'Agence Sud')->first();
        $agenceEst = Agence::where('nom', 'Agence Est')->first();

        // Créer l'administrateur principal
        User::create([
            'name' => 'Administrateur Principal',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'agence_id' => null, // Les admins peuvent gérer toutes les agences
            'active' => true,
            'email_verified_at' => now(),
        ]);

        // Créer un admin par agence
        User::create([
            'name' => 'Admin Centre-Ville',
            'email' => 'admin.centre@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'agence_id' => $agenceCentreVille?->id,
            'active' => true,
            'email_verified_at' => now(),
        ]);

        // Créer des agents pour chaque agence
        $agents = [
            // Agence Centre-Ville
            [
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@example.com',
                'agence_id' => $agenceCentreVille?->id,
                'guichet' => 1,
            ],
            [
                'name' => 'Marie Martin',
                'email' => 'marie.martin@example.com',
                'agence_id' => $agenceCentreVille?->id,
                'guichet' => 2,
            ],
            [
                'name' => 'Pierre Bernard',
                'email' => 'pierre.bernard@example.com',
                'agence_id' => $agenceCentreVille?->id,
                'guichet' => 3,
            ],

            // Agence Nord
            [
                'name' => 'Sophie Dubois',
                'email' => 'sophie.dubois@example.com',
                'agence_id' => $agenceNord?->id,
                'guichet' => 1,
            ],
            [
                'name' => 'Luc Moreau',
                'email' => 'luc.moreau@example.com',
                'agence_id' => $agenceNord?->id,
                'guichet' => 2,
            ],

            // Agence Sud
            [
                'name' => 'Emma Leroy',
                'email' => 'emma.leroy@example.com',
                'agence_id' => $agenceSud?->id,
                'guichet' => 1,
            ],
            [
                'name' => 'Thomas Petit',
                'email' => 'thomas.petit@example.com',
                'agence_id' => $agenceSud?->id,
                'guichet' => 2,
            ],
            [
                'name' => 'Julie Roux',
                'email' => 'julie.roux@example.com',
                'agence_id' => $agenceSud?->id,
                'guichet' => 3,
            ],

            // Agence Est
            [
                'name' => 'Nicolas Blanc',
                'email' => 'nicolas.blanc@example.com',
                'agence_id' => $agenceEst?->id,
                'guichet' => 1,
            ],

            // Agent sans agence (pour test)
            [
                'name' => 'Agent Sans Agence',
                'email' => 'agent.test@example.com',
                'agence_id' => null,
                'guichet' => null,
            ],
        ];

        foreach ($agents as $agentData) {
            User::create([
                'name' => $agentData['name'],
                'email' => $agentData['email'],
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'agence_id' => $agentData['agence_id'],
                'guichet' => $agentData['guichet'],
                'active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Créer un agent inactif pour test
        User::create([
            'name' => 'Agent Inactif',
            'email' => 'agent.inactif@example.com',
            'password' => Hash::make('password123'),
            'role' => 'agent',
            'agence_id' => $agenceCentreVille?->id,
            'guichet' => 4,
            'active' => false,
            'email_verified_at' => now(),
        ]);

        $this->command->info('Utilisateurs créés avec succès !');
        $this->command->info('Connexions de test :');
        $this->command->info('Admin: admin@example.com / password123');
        $this->command->info('Agent: jean.dupont@example.com / password123');
    }
}
