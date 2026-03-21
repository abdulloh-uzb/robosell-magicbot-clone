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
        Schema::table('telegram_messages', function (Blueprint $table) {
            $table->string('group_chat_id')->nullable()->after('customer_id');
            $table->string('sender_telegram_id')->nullable()->after('group_chat_id');
            $table->string('sender_name')->nullable()->after('sender_telegram_id');
            // make customer_id nullable for group messages
            $table->integer('customer_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('telegram_messages', function (Blueprint $table) {
            $table->dropColumn(['group_chat_id', 'sender_telegram_id', 'sender_name']);
            $table->integer('customer_id')->nullable(false)->change();
        });
    }
};
