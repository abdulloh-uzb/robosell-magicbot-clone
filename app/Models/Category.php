<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
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
