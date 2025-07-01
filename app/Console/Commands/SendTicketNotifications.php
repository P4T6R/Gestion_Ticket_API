<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ticket;
use App\Models\Agence;
use Carbon\Carbon;

class SendTicketNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tickets:notify {--test : Mode test sans envoi réel}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envoie des notifications pour les tickets en attente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $testMode = $this->option('test');
        
        if ($testMode) {
            $this->info('🧪 Mode test activé - Aucune notification ne sera envoyée');
        }

        $this->info('Recherche des tickets nécessitant des notifications...');

        // Récupérer les agences ouvertes
        $agencesOuvertes = Agence::where('active', true)->get()->filter(function ($agence) {
            return $agence->estOuverte();
        });

        $totalNotifications = 0;

        foreach ($agencesOuvertes as $agence) {
            $this->info("📍 Traitement de l'agence: {$agence->nom}");

            // Tickets en attente depuis plus de 15 minutes
            $ticketsEnAttenteLongue = Ticket::where('agence_id', $agence->id)
                ->where('statut', 'en_attente')
                ->where('heure_creation', '<', Carbon::now()->subMinutes(15))
                ->get();

            // Tickets appelés mais pas encore pris en charge (en cours depuis plus de 5 minutes)
            $ticketsEnCoursLongs = Ticket::where('agence_id', $agence->id)
                ->where('statut', 'en_cours')
                ->where('heure_appel', '<', Carbon::now()->subMinutes(5))
                ->whereNull('heure_fin')
                ->get();

            // Simuler l'envoi de notifications
            foreach ($ticketsEnAttenteLongue as $ticket) {
                $message = "⏰ Ticket {$ticket->numero} en attente depuis " . 
                    Carbon::parse($ticket->heure_creation)->diffForHumans();
                
                if ($testMode) {
                    $this->line("  [TEST] Notification: {$message}");
                } else {
                    // Ici, vous pourriez intégrer un service de notification réel
                    // comme Firebase, Pusher, ou envoyer des emails
                    $this->sendNotification($ticket, $message);
                }
                
                $totalNotifications++;
            }

            foreach ($ticketsEnCoursLongs as $ticket) {
                $message = "⚠️  Ticket {$ticket->numero} en cours depuis " . 
                    Carbon::parse($ticket->heure_appel)->diffForHumans();
                
                if ($testMode) {
                    $this->line("  [TEST] Alerte: {$message}");
                } else {
                    $this->sendAlert($ticket, $message);
                }
                
                $totalNotifications++;
            }

            // Statistiques de l'agence
            $stats = [
                'en_attente' => $agence->tickets()->where('statut', 'en_attente')->count(),
                'en_cours' => $agence->tickets()->where('statut', 'en_cours')->count(),
            ];

            $this->line("  📊 {$stats['en_attente']} en attente, {$stats['en_cours']} en cours");
        }

        if ($totalNotifications > 0) {
            $this->info("✅ {$totalNotifications} notifications traitées");
        } else {
            $this->info('ℹ️  Aucune notification à envoyer');
        }

        return 0;
    }

    /**
     * Envoie une notification pour un ticket
     */
    private function sendNotification(Ticket $ticket, string $message): void
    {
        // Ici vous pourriez intégrer votre service de notification
        // Exemples : Firebase Cloud Messaging, Pusher, WebSockets, Email, SMS
        
        $this->line("  📤 Notification envoyée: {$message}");
        
        // Log de la notification
        \Illuminate\Support\Facades\Log::info('Notification ticket envoyée', [
            'ticket_id' => $ticket->id,
            'ticket_numero' => $ticket->numero,
            'agence_id' => $ticket->agence_id,
            'message' => $message,
            'sent_at' => now(),
        ]);
    }

    /**
     * Envoie une alerte pour un ticket en cours trop longtemps
     */
    private function sendAlert(Ticket $ticket, string $message): void
    {
        // Envoyer une alerte aux superviseurs ou administrateurs
        
        $this->line("  🚨 Alerte envoyée: {$message}");
        
        \Illuminate\Support\Facades\Log::warning('Alerte ticket en cours prolongé', [
            'ticket_id' => $ticket->id,
            'ticket_numero' => $ticket->numero,
            'agent_id' => $ticket->agent_id,
            'agence_id' => $ticket->agence_id,
            'heure_appel' => $ticket->heure_appel,
            'message' => $message,
            'sent_at' => now(),
        ]);
    }
}
