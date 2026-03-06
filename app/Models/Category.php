<?php

namespace App\Models;

use App\Models\Traits\BelongsToSeller;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use BelongsToSeller;

    protected $guarded = [];

    public function bot()
    {
        return $this->belongsTo(Bot::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
