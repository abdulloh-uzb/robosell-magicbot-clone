<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocaleController extends Controller
{
    protected array $supported = ['en', 'uz', 'ru'];

    public function __invoke(Request $request)
    {
        $locale = $request->validate([
            'locale' => ['required', 'string', 'in:en,uz,ru'],
        ])['locale'];

        session(['locale' => $locale]);
        app()->setLocale($locale);

        return back();
    }
}
