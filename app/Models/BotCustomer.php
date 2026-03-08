<?php

namespace App\Models;

use App\Models\Traits\BelongsToSeller;
use Illuminate\Database\Eloquent\Model;

class BotCustomer extends Model
{
    protected $guarded = [];

    use BelongsToSeller;

    protected $table = 'bot_customer';

    public function bot()
    {
        return $this->belongsTo(Bot::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
