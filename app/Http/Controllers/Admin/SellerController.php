<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SellerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sellers = User::role('seller')->with('bot')->latest()->paginate(20);

        return Inertia::render('admin/sellers/index', [
            'sellers' => $sellers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $seller)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:toggle_block,reset_password',
        ]);

        if ($validated['action'] === 'toggle_block') {
            $seller->update(['is_blocked' => ! $seller->is_blocked]);
            $status = $seller->is_blocked ? 'blocked' : 'unblocked';

            return back()->with('success', "Seller has been {$status}.");
        }

        if ($validated['action'] === 'reset_password') {
            $password = Str::password(12);
            $seller->update(['password' => Hash::make($password)]);

            session()->flash('generated_password', $password);

            return back()->with('success', "Password for {$seller->name} has been reset.");
        }

        return back();
    }
}
