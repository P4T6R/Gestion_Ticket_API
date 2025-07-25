# 🎫 Système de Gestion de Tickets - Backend Laravel

Un backend complet développé avec **Laravel 10** pour gérer une file d'attente de tickets dans des agences, avec support pour applications mobile (clients) et web (agents/administrateurs).

## 🚀 Fonctionnalités

### Pour les Clients (Mobile - Sans authentification)
- ✅ Réserver un ticket pour un service
- ✅ Consulter l'état de la file d'attente
- ✅ Envoyer leur position géographique
- ✅ Consulter le statut de leur ticket
- ✅ Annuler leur ticket

### Pour les Agents (Web - Avec authentification)
- ✅ S'authentifier avec Laravel Sanctum
- ✅ Voir les tickets en file d'attente
- ✅ Appeler le ticket suivant
- ✅ Terminer un ticket
- ✅ Consulter leur historique et statistiques

### Pour les Administrateurs
- ✅ Toutes les fonctionnalités des agents
- ✅ Statistiques globales et rapports
- ✅ Tableau de bord temps réel
- ✅ Gestion des utilisateurs
- ✅ Export de données

## 🏗️ Architecture

### Modèles de données
- **Agence** : Points de service avec horaires et géolocalisation
- **Ticket** : Tickets avec numérotation automatique et tracking complet
- **User** : Agents et administrateurs avec rôles
- **DistributionLog** : Historique des actions pour audit

### API REST
- **Routes publiques** : `/api/tickets/*` (pour clients mobile)
- **Routes d'authentification** : `/api/auth/*`
- **Routes agents** : `/api/agent/*` (protégées)
- **Routes admin** : `/api/admin/*` (super protégées)

## 📋 Prérequis

- PHP 8.1+
- MySQL 8.0+
- Composer
- Laravel 10

## 🔧 Installation

### 1. Installation des dépendances
```bash
composer install
```

### 2. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer votre base de données dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=votre_base_de_donnees
DB_USERNAME=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
```

### 3. Base de données
```bash
# Exécuter les migrations
php artisan migrate

# Peupler avec des données de test
php artisan db:seed
```

### 4. Démarrage
```bash
# Démarrer le serveur de développement
php artisan serve
```

L'API sera accessible sur `http://localhost:8000/api`

## 📚 Utilisation

### Comptes de test créés
- **Admin** : `admin@example.com` / `password123`
- **Agent** : `jean.dupont@example.com` / `password123`

### Test rapide avec curl

#### 1. Créer un ticket (client)
```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "service": "facture_eau",
    "agence_id": 1,
    "client_latitude": 45.764043,
    "client_longitude": 4.835659
  }'
```

#### 2. Connexion agent
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "password123"
  }'
```

#### 3. Appeler un ticket (agent)
```bash
curl -X POST http://localhost:8000/api/agent/call-next \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

## 🔄 Automatisation

### Commandes disponibles
```bash
# Nettoyer les anciens tickets (30 jours par défaut)
php artisan tickets:cleanup --days=30

# Envoyer des notifications
php artisan tickets:notify

# Mode test des notifications
php artisan tickets:notify --test

# Planificateur (à ajouter au cron)
php artisan schedule:run
```

### Configuration du cron (Production)
```bash
# Ajouter à votre crontab
* * * * * cd /chemin/vers/votre/projet && php artisan schedule:run >> /dev/null 2>&1
```

## 🔒 Sécurité

- **Authentification** : Laravel Sanctum avec tokens
- **Autorisation** : Middlewares de rôles personnalisés
- **Validation** : Validation stricte des données d'entrée
- **CORS** : Configuration pour apps mobile et web
- **Logs** : Audit complet des actions

## 📊 Monitoring

### Logs disponibles
- Actions des agents dans `storage/logs/laravel.log`
- Nettoyage automatique dans `DistributionLog`
- Notifications dans les logs système

### Métriques suivies
- Temps d'attente moyen
- Temps de traitement par agent
- Taux de completion des tickets
- Performance par agence et service

## 🌐 Configuration CORS

Modifiez `config/cors.php` pour vos domaines :
```php
'allowed_origins' => [
    'http://localhost:3000',  // React/Vue local
    'https://votre-app.com',  // Production
],
```

## 📱 Intégration Frontend

### Exemples d'intégration

#### React/Vue (Web - Agents)
```javascript
// Connexion
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Appeler un ticket
const callNext = await fetch('/api/agent/call-next', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### React Native/Flutter (Mobile - Clients)
```javascript
// Créer un ticket
const ticket = await fetch('/api/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service: 'facture_eau',
    agence_id: 1,
    client_latitude: position.latitude,
    client_longitude: position.longitude
  })
});
```

## 🔧 Personnalisation

### Ajouter un nouveau service
1. Modifier `$fillable` dans `Ticket.php`
2. Ajouter le service dans `genererNumero()`
3. Mettre à jour la validation dans `TicketController`

### Modifier les horaires d'ouverture
1. Éditer les seeders dans `database/seeders/AgenceSeeder.php`
2. Ou via l'API admin (à implémenter selon besoins)

### Notifications personnalisées
Modifier `app/Console/Commands/SendTicketNotifications.php` pour intégrer :
- Firebase Cloud Messaging
- Pusher
- Emails
- SMS

## 📖 Documentation complète

Consultez `API_DOCUMENTATION.md` pour la documentation complète de l'API avec tous les endpoints, paramètres et exemples.

## 🐛 Dépannage

### Erreurs courantes

#### Migration échouée
```bash
php artisan migrate:reset
php artisan migrate
php artisan db:seed
```

#### Token expiré
```bash
# Les tokens expirent après 24h par défaut
# Configurez dans config/sanctum.php
```

#### CORS bloqué
```bash
# Vérifiez config/cors.php
# Ajoutez votre domaine frontend
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Laravel Framework
- Laravel Sanctum pour l'authentification
- Communauté Laravel

---

**Développé avec ❤️ et Laravel 10**

Pour toute question : +226 57825032 / P4T6R
