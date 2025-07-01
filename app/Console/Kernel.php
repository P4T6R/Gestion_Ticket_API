<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Nettoyage automatique des anciens tickets tous les jours à 2h du matin
        $schedule->command('tickets:cleanup --days=30')
            ->dailyAt('02:00')
            ->onOneServer()
            ->runInBackground();

        // Envoi de notifications toutes les 5 minutes pendant les heures d'ouverture
        $schedule->command('tickets:notify')
            ->everyFiveMinutes()
            ->between('08:00', '18:00')
            ->weekdays()
            ->onOneServer();

        // Envoi de notifications en mode test le samedi (pour vérifier le système)
        $schedule->command('tickets:notify --test')
            ->saturdays()
            ->at('10:00')
            ->onOneServer();

        // Sauvegarde automatique des logs importants une fois par semaine
        $schedule->command('backup:database')
            ->weekly()
            ->sundays()
            ->at('03:00')
            ->onOneServer()
            ->when(function () {
                // Seulement si la commande de backup existe
                return \Illuminate\Support\Facades\Artisan::call('list') !== false;
            });

        // Génération de rapports statistiques mensuels
        $schedule->call(function () {
            // Ici vous pourriez générer des rapports automatiques
            \Illuminate\Support\Facades\Log::info('Génération du rapport mensuel programmée');
        })->monthlyOn(1, '09:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
