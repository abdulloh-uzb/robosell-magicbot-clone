<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Models\Traits\BelongsToSeller;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use BelongsToSeller;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
        ];
    }

    public function bot()
    {
        return $this->belongsTo(Bot::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
