<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Mettre à jour toutes les agences existantes pour qu'elles ouvrent à 00:00 (minuit - 24h/24)
        DB::table('agences')->update([
            'heure_ouverture' => '00:00:00'
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurer l'ancien horaire d'ouverture (05:00)
        DB::table('agences')->update([
            'heure_ouverture' => '05:00:00'
        ]);
    }
};
