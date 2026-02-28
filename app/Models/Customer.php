<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $guarded = [];

    public function bot()
    {
        return $this->belongsTo(Bot::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
