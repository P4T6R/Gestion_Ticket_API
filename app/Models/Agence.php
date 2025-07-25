<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $nom
 * @property string $adresse
 * @property string|null $telephone
 * @property string|null $email
 * @property string $heure_ouverture
 * @property string $heure_fermeture
 * @property bool $active
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Agence extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'adresse',
        'latitude',
        'longitude',
        'active',
        'heure_ouverture',
        'heure_fermeture',
        'jours_ouverture',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'jours_ouverture' => 'array',
    ];

    /**
     * Relation avec les tickets
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Relation avec les utilisateurs (agents)
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Relation avec les logs de distribution
     */
    public function distributionLogs(): HasMany
    {
        return $this->hasMany(DistributionLog::class);
    }

    /**
     * Vérifie si l'agence est ouverte maintenant
     */
    public function estOuverte(): bool
    {
        if (!$this->active) {
            return false;
        }

        $maintenant = now();
        
        // Conversion du jour de la semaine en français
        $joursMapping = [
            'Monday' => 'lundi',
            'Tuesday' => 'mardi', 
            'Wednesday' => 'mercredi',
            'Thursday' => 'jeudi',
            'Friday' => 'vendredi',
            'Saturday' => 'samedi',
            'Sunday' => 'dimanche'
        ];
        
        $jourActuel = $joursMapping[$maintenant->format('l')] ?? 'lundi';
        
        // Vérifier si l'agence est ouverte ce jour
        if (!in_array($jourActuel, $this->jours_ouverture ?? [])) {
            return false;
        }

        // Convertir les heures en format comparable (HH:MM:SS)
        $heureActuelle = $maintenant->format('H:i:s');
        
        // Extraire juste l'heure des champs time
        $heureOuverture = is_string($this->heure_ouverture) 
            ? $this->heure_ouverture 
            : substr($this->heure_ouverture, 0, 8); // Pour extraire HH:MM:SS du datetime
            
        $heureFermeture = is_string($this->heure_fermeture) 
            ? $this->heure_fermeture 
            : substr($this->heure_fermeture, 0, 8); // Pour extraire HH:MM:SS du datetime
        
        return $heureActuelle >= $heureOuverture && $heureActuelle <= $heureFermeture;
    }

    /**
     * Obtenir les tickets en attente pour cette agence
     */
    public function getTicketsEnAttente()
    {
        return $this->tickets()
            ->where('statut', 'en_attente')
            ->orderBy('heure_creation')
            ->get();
    }
}
