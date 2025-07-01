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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique(); // Format: A001, B042, etc.
            $table->string('service'); // Type de service (facture eau, banque, etc.)
            $table->enum('statut', ['en_attente', 'en_cours', 'termine', 'annule'])->default('en_attente');
            $table->foreignId('agence_id')->constrained('agences')->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('client_latitude', 10, 8)->nullable();
            $table->decimal('client_longitude', 11, 8)->nullable();
            $table->timestamp('heure_creation');
            $table->timestamp('heure_appel')->nullable();
            $table->timestamp('heure_fin')->nullable();
            $table->integer('temps_attente')->nullable(); // en minutes
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['agence_id', 'statut']);
            $table->index(['service', 'statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
