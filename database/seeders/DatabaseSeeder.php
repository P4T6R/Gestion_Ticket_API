<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ordre important : d'abord les agences, puis les utilisateurs
        $this->call([
            AgenceSeeder::class,
            UserSeeder::class,
        ]);
    }
}
