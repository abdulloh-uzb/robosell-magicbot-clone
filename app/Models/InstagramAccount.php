<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InstagramAccount extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'token_expires_at' => 'datetime',
            'access_token' => 'encrypted',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(InstagramMessage::class);
    }
}
