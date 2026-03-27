<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('bot_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // click | payme | cash
            $table->boolean('enabled')->default(false);
            $table->json('credentials')->nullable(); // service_id, merchant_id, secret_key
            $table->timestamps();

            $table->unique(['bot_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
