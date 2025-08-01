<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000', // React/Vue frontend local
        'http://localhost:8080', // Vue CLI default
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        // Ajouter ici vos domaines de production
        // 'https://votre-app-mobile.com',
        // 'https://votre-app-web.com',
    ],

    'allowed_origins_patterns' => [
        // Patterns pour les environnements de développement
        '/^http:\/\/localhost:\d+$/',
        '/^http:\/\/127\.0\.0\.1:\d+$/',
    ],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
    ],

    'exposed_headers' => [
        'X-Pagination-Total',
        'X-Pagination-Per-Page',
        'X-Pagination-Current-Page',
        'X-Pagination-Last-Page',
    ],

    'max_age' => 86400, // 24 heures

    'supports_credentials' => true,

];
