<?php

namespace App\Models;

use App\Models\Traits\BelongsToSeller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    use BelongsToSeller;

    protected $guarded = [];

    public function bot(): BelongsTo
    {
        return $this->belongsTo(Bot::class);
    }
}
