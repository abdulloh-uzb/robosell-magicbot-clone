<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Seller private channel — only the authenticated seller with matching ID
Broadcast::channel('seller.{sellerId}', function ($user, int $sellerId) {
    return (int) $user->id === (int) $sellerId;
});
