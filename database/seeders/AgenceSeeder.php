<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Agence;

class AgenceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agences = [
            [
                'nom' => 'Agence Centre-Ville',
                'adresse' => '123 Rue de la République, Centre-Ville',
                'latitude' => 45.764043,
                'longitude' => 4.835659,
                'active' => true,
                'heure_ouverture' => '08:00:00',
                'heure_fermeture' => '17:00:00',
                'jours_ouverture' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
            ],
            [
                'nom' => 'Agence Nord',
                'adresse' => '456 Avenue du Nord, Quartier Nord',
                'latitude' => 45.774043,
                'longitude' => 4.845659,
                'active' => true,
                'heure_ouverture' => '08:30:00',
                'heure_fermeture' => '16:30:00',
                'jours_ouverture' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
            ],
            [
                'nom' => 'Agence Sud',
                'adresse' => '789 Boulevard du Sud, Quartier Sud',
                'latitude' => 45.754043,
                'longitude' => 4.825659,
                'active' => true,
                'heure_ouverture' => '09:00:00',
                'heure_fermeture' => '17:30:00',
                'jours_ouverture' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            ],
            [
                'nom' => 'Agence Est',
                'adresse' => '321 Place de l\'Est, Quartier Est',
                'latitude' => 45.764043,
                'longitude' => 4.855659,
                'active' => true,
                'heure_ouverture' => '08:00:00',
                'heure_fermeture' => '16:00:00',
                'jours_ouverture' => ['lundi', 'mercredi', 'vendredi'],
            ],
            [
                'nom' => 'Agence Ouest (Fermée)',
                'adresse' => '654 Rue de l\'Ouest, Quartier Ouest',
                'latitude' => 45.764043,
                'longitude' => 4.815659,
                'active' => false,
                'heure_ouverture' => '08:00:00',
                'heure_fermeture' => '17:00:00',
                'jours_ouverture' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
            ],
        ];

        foreach ($agences as $agence) {
            Agence::create($agence);
        }

        $this->command->info('Agences créées avec succès !');
    }
}
