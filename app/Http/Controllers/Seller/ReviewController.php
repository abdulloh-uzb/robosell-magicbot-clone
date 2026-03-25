<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = Review::where('bot_id', session('bot_id'))
            ->with(['product:id,name', 'customer:id,name,username'])
            ->latest()
            ->paginate(20);

        return Inertia::render('seller/reviews/index', [
            'reviews' => $reviews,
        ]);
    }
}
