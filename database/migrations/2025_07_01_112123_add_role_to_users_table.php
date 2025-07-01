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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['agent', 'admin'])->default('agent');
            $table->foreignId('agence_id')->nullable()->constrained('agences')->onDelete('set null');
            $table->boolean('active')->default(true);
            $table->timestamp('derniere_connexion')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['agence_id']);
            $table->dropColumn(['role', 'agence_id', 'active', 'derniere_connexion']);
        });
    }
};
