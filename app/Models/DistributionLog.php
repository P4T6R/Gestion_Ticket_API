<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DistributionLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_id',
        'agent_id',
        'agence_id',
        'guichet',
        'action',
        'horodatage',
        'commentaire',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'horodatage' => 'datetime',
    ];

    /**
     * Les actions possibles dans les logs
     */
    const ACTIONS = [
        'appel' => 'Appel du ticket',
        'traitement_debut' => 'Début du traitement',
        'traitement_fin' => 'Fin du traitement',
        'annulation' => 'Annulation du ticket'
    ];

    /**
     * Relation avec le ticket
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Relation avec l'agent
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Relation avec l'agence
     */
    public function agence(): BelongsTo
    {
        return $this->belongsTo(Agence::class);
    }

    /**
     * Scope pour filtrer par période
     */
    public function scopePeriode($query, $debut, $fin)
    {
        return $query->whereBetween('horodatage', [$debut, $fin]);
    }

    /**
     * Scope pour filtrer par agence
     */
    public function scopeAgence($query, $agenceId)
    {
        return $query->where('agence_id', $agenceId);
    }

    /**
     * Scope pour filtrer par agent
     */
    public function scopeAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }
}
