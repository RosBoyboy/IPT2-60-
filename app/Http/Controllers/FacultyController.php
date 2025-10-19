<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\ArchivedFaculty;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    public function index(Request $request)
    {
        $query = Faculty::where('status', 'ACTIVE'); // Only show active faculties

        if ($request->filled('department') && $request->department !== 'All') {
            $query->where('department', $request->department);
        }
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('faculty_number', 'like', "%{$s}%")
                  ->orWhere('position', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $faculties = $query->orderBy('id')->get();

        return response()->json(['faculties' => $faculties]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'faculty_number' => 'required|string|max:50|unique:faculties,faculty_number',
            'name'           => 'required|string|max:255',
            'department'     => 'nullable|string|max:255',
            'position'       => 'nullable|string|max:255',
            'email'          => 'nullable|email|max:255',
            'contact'        => 'nullable|string|max:50',
            'status'         => 'required|in:ACTIVE,INACTIVE',
        ]);

        $faculty = Faculty::create($validated);

        return response()->json([
            'faculty' => $faculty,
            'success' => 'Faculty added successfully!'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);

        $validated = $request->validate([
            'faculty_number' => 'required|string|max:50|unique:faculties,faculty_number,' . $faculty->id,
            'name'           => 'required|string|max:255',
            'department'     => 'nullable|string|max:255',
            'position'       => 'nullable|string|max:255',
            'email'          => 'nullable|email|max:255',
            'contact'        => 'nullable|string|max:50',
            'status'         => 'required|in:ACTIVE,INACTIVE',
        ]);

        $faculty->update($validated);

        return response()->json([
            'faculty' => $faculty,
            'success' => 'Faculty updated successfully!'
        ]);
    }

    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);

        // Instead of deleting, set status to INACTIVE
        $faculty->update(['status' => 'INACTIVE']);

        // Also archive the record
        ArchivedFaculty::create([
            'faculty_number' => $faculty->faculty_number,
            'name' => $faculty->name,
            'department' => $faculty->department,
            'position' => $faculty->position,
            'email' => $faculty->email,
            'contact' => $faculty->contact,
            'status' => 'INACTIVE',
            'archived_at' => now(),
            'archived_reason' => 'Moved to inactive status'
        ]);

        return response()->json([
            'success' => 'Faculty moved to inactive status and archived!'
        ]);
    }

    public function archiveIndex(Request $request)
    {
        $query = ArchivedFaculty::query();

        if ($request->filled('department') && $request->department !== 'All') {
            $query->where('department', $request->department);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('faculty_number', 'like', "%{$s}%")
                  ->orWhere('position', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $archivedFaculties = $query->orderBy('archived_at', 'desc')->get();

        return response()->json(['archived_faculties' => $archivedFaculties]);
    }

    public function restore($id)
    {
        $archivedFaculty = ArchivedFaculty::findOrFail($id);

        // Find the original faculty record
        $faculty = Faculty::where('faculty_number', $archivedFaculty->faculty_number)->first();

        if ($faculty) {
            // Update the existing faculty to ACTIVE
            $faculty->update(['status' => 'ACTIVE']);
            
            // Delete from archived
            $archivedFaculty->delete();

            return response()->json([
                'faculty' => $faculty,
                'success' => 'Faculty restored successfully!'
            ]);
        }

        return response()->json([
            'error' => 'Original faculty record not found.'
        ], 404);
    }

    public function forceDelete($id)
    {
        $archivedFaculty = ArchivedFaculty::findOrFail($id);
        $archivedFaculty->delete();

        return response()->json([
            'success' => 'Archived faculty permanently deleted!'
        ]);
    }

    // Other methods remain the same...
    public function create()
    {
        //
    }

    public function show(Faculty $faculty)
    {
        //
    }

    public function edit(Faculty $faculty)
    {
        //
    }
}