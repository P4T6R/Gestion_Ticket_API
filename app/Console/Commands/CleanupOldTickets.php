<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ticket;
use Carbon\Carbon;

class CleanupOldTickets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tickets:cleanup {--days=30 : Nombre de jours à conserver}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Nettoie les anciens tickets terminés ou annulés';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Nettoyage des tickets antérieurs au {$cutoffDate->format('Y-m-d H:i:s')}...");

        // Compter les tickets à supprimer
        $ticketsToDelete = Ticket::whereIn('statut', ['termine', 'annule'])
            ->where('updated_at', '<', $cutoffDate)
            ->count();

        if ($ticketsToDelete === 0) {
            $this->info('Aucun ticket à nettoyer.');
            return 0;
        }

        $this->info("Nombre de tickets à supprimer : {$ticketsToDelete}");

        if ($this->confirm('Voulez-vous continuer ?')) {
            // Supprimer les tickets et leurs logs associés
            $deletedCount = Ticket::whereIn('statut', ['termine', 'annule'])
                ->where('updated_at', '<', $cutoffDate)
                ->delete();

            $this->info("✅ {$deletedCount} tickets supprimés avec succès.");
            
            // Log de l'opération
            \Illuminate\Support\Facades\Log::info("Cleanup automatique: {$deletedCount} tickets supprimés", [
                'cutoff_date' => $cutoffDate,
                'executed_at' => now(),
            ]);
        } else {
            $this->info('Opération annulée.');
        }

        return 0;
    }
}
