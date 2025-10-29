<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    private function getDemoUser(): User
    {
        // For this app, we use a single admin user. Create if missing.
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Admin',
                'email' => 'admin@university.edu',
                'role' => 'Administrator',
                'department' => 'System Administration',
                'password' => Hash::make('admin456'),
                'joined_at' => now()->toDateString(),
            ]);
        } else {
            // Auto-correct the seeded demo user's name if it's still the placeholder
            if ($user->email === 'admin@university.edu' && ($user->name === null || trim($user->name) === '' || strtolower(trim($user->name)) === 'john doe')) {
                $user->name = 'Admin';
                if (!$user->joined_at) {
                    $user->joined_at = now()->toDateString();
                }
                $user->save();
            }
        }
        return $user;
    }

    public function show(Request $request)
    {
        $user = $this->getDemoUser();
        return response()->json(['user' => $user]);
    }

    public function update(Request $request)
    {
        $user = $this->getDemoUser();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'department' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'profile.update',
            'ip_address' => $request->ip(),
            'details' => 'Updated profile information',
        ]);

        return response()->json(['user' => $user, 'success' => 'Profile updated successfully.']);
    }

    public function changePassword(Request $request)
    {
        $user = $this->getDemoUser();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['errors' => ['current_password' => ['Current password is incorrect']]], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'profile.change_password',
            'ip_address' => $request->ip(),
            'details' => null,
        ]);

        return response()->json(['success' => 'Password changed successfully.']);
    }

    public function logs(Request $request)
    {
        $user = $this->getDemoUser();
        $query = ActivityLog::where('user_id', $user->id)->orderByDesc('id');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        return response()->json(['logs' => $query->limit(200)->get()]);
    }
}


