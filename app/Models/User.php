<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string $role
 * @property int|null $agence_id
 * @property string|null $guichet
 * @property bool $active
 * @property \Carbon\Carbon|null $derniere_connexion
 * @property \Carbon\Carbon|null $email_verified_at
 * @property string|null $remember_token
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'agence_id',
        'guichet',
        'active',
        'derniere_connexion',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'active' => 'boolean',
        'derniere_connexion' => 'datetime',
    ];

    /**
     * Les rôles possibles
     */
    const ROLES = [
        'agent' => 'Agent',
        'admin' => 'Administrateur'
    ];

    /**
     * Relation avec l'agence
     */
    public function agence(): BelongsTo
    {
        return $this->belongsTo(Agence::class);
    }

    /**
     * Relation avec les tickets assignés
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'agent_id');
    }

    /**
     * Relation avec les logs de distribution
     */
    public function distributionLogs(): HasMany
    {
        return $this->hasMany(DistributionLog::class, 'agent_id');
    }

    /**
     * Vérifie si l'utilisateur est un administrateur
     */
    public function estAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Vérifie si l'utilisateur est un agent
     */
    public function estAgent(): bool
    {
        return $this->role === 'agent';
    }

    /**
     * Obtient le ticket actuellement en cours pour cet agent
     */
    public function getTicketEnCours()
    {
        return $this->tickets()
            ->where('statut', 'en_cours')
            ->first();
    }

    /**
     * Met à jour l'heure de dernière connexion
     */
    public function mettreAJourDerniereConnexion(): void
    {
        $this->update(['derniere_connexion' => now()]);
    }
}
