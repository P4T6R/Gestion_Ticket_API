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
        Schema::table('distribution_logs', function (Blueprint $table) {
            $table->integer('guichet')->nullable()->after('agent_id')->comment('Numéro du guichet utilisé pour servir le client');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('distribution_logs', function (Blueprint $table) {
            $table->dropColumn('guichet');
        });
    }
};
