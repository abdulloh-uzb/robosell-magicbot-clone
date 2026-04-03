<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToSeller
{
    public static function bootBelongsToSeller()
    {
        static::creating(function ($model) {
            if (! $model->seller_id) {
                $model->seller_id = auth()->id();
            }
            if (! $model->bot_id) {
                $model->bot_id = session('bot_id');
            }
        });

        static::addGlobalScope('seller', function (Builder $builder) {
            $user = auth()->user();

            if ($user && $user->hasRole('seller') && session()->has('bot_id')) {
                $builder->where('seller_id', $user->id)
                    ->where('bot_id', session('bot_id'));
            }
        });
    }
}
