<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramMessage extends Model
{
    protected $guarded = [];

    public function bot(): BelongsTo
    {
        return $this->belongsTo(Bot::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
