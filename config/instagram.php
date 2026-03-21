<?php

return [
    'app_id' => env('INSTAGRAM_APP_ID'),
    'app_secret' => env('INSTAGRAM_APP_SECRET'),
    'webhook_verify_token' => env('INSTAGRAM_WEBHOOK_VERIFY_TOKEN', 'robosell_verify_token'),
    'redirect_uri' => env('INSTAGRAM_REDIRECT_URI'),
];
