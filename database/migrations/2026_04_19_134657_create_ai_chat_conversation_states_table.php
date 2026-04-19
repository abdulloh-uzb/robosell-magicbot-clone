<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_chat_conversation_states', function (Blueprint $table) {
            $table->id();
            $table->string('platform', 16);
            $table->foreignId('bot_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('instagram_account_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('sender_instagram_id')->nullable();
            $table->unsignedInteger('ai_reply_count')->default(0);
            $table->unsignedInteger('off_topic_count')->default(0);
            $table->boolean('handed_off_to_seller')->default(false);
            $table->timestamp('last_reply_at')->nullable();
            $table->timestamps();

            $table->unique(['bot_id', 'customer_id'], 'ai_state_telegram_unique');
            $table->unique(['instagram_account_id', 'sender_instagram_id'], 'ai_state_instagram_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_chat_conversation_states');
    }
};
