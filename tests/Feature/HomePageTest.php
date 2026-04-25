<?php

test('home route renders the welcome Inertia page', function (): void {
    $this->get(route('home'))
        ->assertOk()
        ->assertSee('&quot;component&quot;:&quot;welcome&quot;', false)
        ->assertSee('/favicon.svg', false);
});
