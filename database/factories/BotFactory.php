<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bot>
 */
class BotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seller_id' => User::factory(),
            'token' => fake()->numerify('##########').':'.fake()->regexify('[A-Za-z0-9_-]{35}'),
            'username' => fake()->unique()->userName().'_bot',
            'name' => fake()->words(2, true).' Bot',
            'channel_id' => null,
        ];
    }
}
