<?php

use App\Models\Bot;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true, 'result' => true], 200),
    ]);
});

test('seller can reset webhook for their own bot', function () {
    $seller = User::factory()->create();
    $bot = Bot::factory()->for($seller, 'seller')->create();

    $response = $this->actingAs($seller)->post("/settings/bots/{$bot->id}/reset-webhook");

    $response->assertRedirect();
    Http::assertSent(fn ($request) => str_contains($request->url(), 'setWebhook'));
});

test('seller cannot reset webhook of another sellers bot', function () {
    $seller = User::factory()->create();
    $otherBot = Bot::factory()->create();

    $response = $this->actingAs($seller)->post("/settings/bots/{$otherBot->id}/reset-webhook");

    $response->assertForbidden();
});

test('seller cannot delete another sellers bot', function () {
    $seller = User::factory()->create();
    $otherBot = Bot::factory()->create();

    $response = $this->actingAs($seller)->delete("/settings/bots/{$otherBot->id}");

    $response->assertForbidden();
});

test('seller can delete their own bot', function () {
    $seller = User::factory()->create();
    $bot = Bot::factory()->for($seller, 'seller')->create();

    $response = $this->actingAs($seller)->delete("/settings/bots/{$bot->id}");

    $response->assertRedirect();
    $this->assertModelMissing($bot);
});

test('guests cannot access bot routes', function () {
    $bot = Bot::factory()->create();

    $this->post("/settings/bots/{$bot->id}/reset-webhook")->assertRedirect(route('login'));
    $this->delete("/settings/bots/{$bot->id}")->assertRedirect(route('login'));
});
