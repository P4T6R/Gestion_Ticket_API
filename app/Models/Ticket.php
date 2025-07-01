<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Ticket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'numero',
        'service',
        'statut',
        'agence_id',
        'agent_id',
        'guichet',
        'client_latitude',
        'client_longitude',
        'heure_creation',
        'heure_appel',
        'heure_fin',
        'temps_attente',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'client_latitude' => 'decimal:8',
        'client_longitude' => 'decimal:8',
        'heure_creation' => 'datetime',
        'heure_appel' => 'datetime',
        'heure_fin' => 'datetime',
        'temps_attente' => 'integer',
    ];

    /**
     * Les statuts possibles pour un ticket
     */
    const STATUTS = [
        'en_attente' => 'En attente',
        'en_cours' => 'En cours',
        'termine' => 'Terminé',
        'annule' => 'Annulé'
    ];

    /**
     * Relation avec l'agence
     */
    public function agence(): BelongsTo
    {
        return $this->belongsTo(Agence::class);
    }

    /**
     * Relation avec l'agent (utilisateur)
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Relation avec les logs de distribution
     */
    public function distributionLogs(): HasMany
    {
        return $this->hasMany(DistributionLog::class);
    }

    /**
     * Génère un nouveau numéro de ticket pour l'agence et le service
     */
    public static function genererNumero(int $agenceId, string $service): string
    {
        // Préfixe basé sur le service
        $prefixes = [
            'payement_factures' => 'PF',
            'depot_retrait' => 'DR',
            'transfert' => 'TR',
            'conseil_clientele' => 'CC',
            // Anciens services pour compatibilité
            'facture_eau' => 'FE',
            'banque' => 'BQ',
            'administration' => 'AD',
            'social' => 'SO',
            'autre' => 'AU'
        ];

        $prefixe = $prefixes[$service] ?? 'GE'; // GE = Général

        // Compter les tickets créés aujourd'hui pour cette agence et ce service
        $compteur = self::where('agence_id', $agenceId)
            ->where('service', $service)
            ->whereDate('heure_creation', Carbon::today())
            ->count() + 1;

        return $prefixe . str_pad($compteur, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Calcule le temps d'attente estimé en minutes
     */
    public function getTempsAttenteEstime(): int
    {
        if ($this->statut !== 'en_attente') {
            return 0;
        }

        // Nombre de tickets avant celui-ci dans la file
        $ticketsAvant = self::where('agence_id', $this->agence_id)
            ->where('statut', 'en_attente')
            ->where('heure_creation', '<', $this->heure_creation)
            ->count();

        // Temps moyen de traitement (5 minutes par défaut)
        $tempsMoyenTraitement = 5;

        return $ticketsAvant * $tempsMoyenTraitement;
    }

    /**
     * Calcule la position dans la file d'attente
     */
    public function getPositionDansLaFile(): int
    {
        if ($this->statut !== 'en_attente') {
            return 0;
        }

        return self::where('agence_id', $this->agence_id)
            ->where('statut', 'en_attente')
            ->where('heure_creation', '<=', $this->heure_creation)
            ->count();
    }

    /**
     * Marque le ticket comme appelé par un agent
     */
    public function appeler(User $agent): bool
    {
        if ($this->statut !== 'en_attente') {
            return false;
        }

        $this->update([
            'statut' => 'en_cours',
            'agent_id' => $agent->id,
            'guichet' => $agent->guichet,
            'heure_appel' => now(),
            'temps_attente' => Carbon::parse($this->heure_creation)->diffInMinutes(now())
        ]);

        // Enregistrer dans les logs
        $this->distributionLogs()->create([
            'agent_id' => $agent->id,
            'agence_id' => $this->agence_id,
            'guichet' => $agent->guichet,
            'action' => 'appel',
            'horodatage' => now(),
            'commentaire' => "Ticket appelé par {$agent->name}" . ($agent->guichet ? " au guichet {$agent->guichet}" : "")
        ]);

        return true;
    }

    /**
     * Marque le ticket comme terminé
     */
    public function terminer(string $notes = null): bool
    {
        if ($this->statut !== 'en_cours') {
            return false;
        }

        $this->update([
            'statut' => 'termine',
            'heure_fin' => now(),
            'notes' => $notes
        ]);

        // Enregistrer dans les logs
        $this->distributionLogs()->create([
            'agent_id' => $this->agent_id,
            'agence_id' => $this->agence_id,
            'guichet' => $this->guichet,
            'action' => 'traitement_fin',
            'horodatage' => now(),
            'commentaire' => $notes ?? 'Ticket terminé'
        ]);

        return true;
    }
}
