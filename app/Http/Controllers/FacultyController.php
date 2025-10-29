<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\ArchivedFaculty;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Carbon\Carbon;

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
            'gender'         => 'nullable|string|max:20',
            'dob'            => 'nullable|date',
            'age'            => 'nullable|integer|min:0',
            'street_address' => 'nullable|string|max:255',
            'city_municipality' => 'nullable|string|max:255',
            'province_region'   => 'nullable|string|max:255',
            'zip_code'       => 'nullable|string|max:20',
        ]);

        if (!empty($validated['dob'])) {
            try {
                $validated['age'] = Carbon::parse($validated['dob'])->age;
            } catch (\Exception $e) {
            }
        }

        $faculty = Faculty::create($validated);

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'faculty.create',
            'entity_type' => 'faculty',
            'entity_id' => $faculty->id,
            'ip_address' => $request->ip(),
            'details' => $faculty->faculty_number,
        ]);

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
            'gender'         => 'nullable|string|max:20',
            'dob'            => 'nullable|date',
            'age'            => 'nullable|integer|min:0',
            'street_address' => 'nullable|string|max:255',
            'city_municipality' => 'nullable|string|max:255',
            'province_region'   => 'nullable|string|max:255',
            'zip_code'       => 'nullable|string|max:20',
        ]);

        if (!empty($validated['dob'])) {
            try {
                $validated['age'] = Carbon::parse($validated['dob'])->age;
            } catch (\Exception $e) {
            }
        }

        $faculty->update($validated);

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'faculty.update',
            'entity_type' => 'faculty',
            'entity_id' => $faculty->id,
            'ip_address' => $request->ip(),
            'details' => $faculty->faculty_number,
        ]);

        return response()->json([
            'faculty' => $faculty,
            'success' => 'Faculty updated successfully!'
        ]);
    }

    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);

        // Instead of deleting, set status to INACTIVE and mark archived timestamp
        $faculty->update(['status' => 'INACTIVE', 'archived_at' => now()]);

        // Also archive the record
        ArchivedFaculty::create([
            'faculty_number' => $faculty->faculty_number,
            'name' => $faculty->name,
            'department' => $faculty->department,
            'position' => $faculty->position,
            'email' => $faculty->email,
            'contact' => $faculty->contact,
            'gender' => $faculty->gender,
            'dob' => $faculty->dob,
            'age' => $faculty->age,
            'street_address' => $faculty->street_address,
            'city_municipality' => $faculty->city_municipality,
            'province_region' => $faculty->province_region,
            'zip_code' => $faculty->zip_code,
            'status' => 'INACTIVE',
            'archived_at' => now(),
            'archived_reason' => 'Moved to inactive status'
        ]);

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'faculty.archive',
            'entity_type' => 'faculty',
            'entity_id' => $faculty->id,
            'ip_address' => request()->ip(),
            'details' => $faculty->faculty_number,
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
            // Update the existing faculty to ACTIVE and clear archived timestamp
            $faculty->update(['status' => 'ACTIVE', 'archived_at' => null]);
            
            // Delete from archived
            $archivedFaculty->delete();

            ActivityLog::create([
                'user_id' => 1,
                'action' => 'faculty.restore',
                'entity_type' => 'faculty',
                'entity_id' => $faculty->id,
                'ip_address' => request()->ip(),
                'details' => $faculty->faculty_number,
            ]);

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

        // Also delete the original faculty record if it exists
        $faculty = Faculty::where('faculty_number', $archivedFaculty->faculty_number)->first();
        if ($faculty) {
            $faculty->delete();
        }

        // Remove from archived table
        $archivedFaculty->delete();

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'faculty.force_delete',
            'entity_type' => 'faculty',
            'entity_id' => $id,
            'ip_address' => request()->ip(),
            'details' => $archivedFaculty->faculty_number,
        ]);

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