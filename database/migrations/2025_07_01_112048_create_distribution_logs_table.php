<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('distribution_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agence_id')->constrained('agences')->onDelete('cascade');
            $table->enum('action', ['appel', 'traitement_debut', 'traitement_fin', 'annulation']);
            $table->timestamp('horodatage');
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            // Index pour les statistiques
            $table->index(['agence_id', 'horodatage']);
            $table->index(['agent_id', 'horodatage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distribution_logs');
    }
};
