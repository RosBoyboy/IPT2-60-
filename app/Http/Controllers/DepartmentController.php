<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\ActivityLog;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $departments = $query->orderBy('name')->get();
        return response()->json(['departments' => $departments]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'is_default' => 'nullable|boolean',
        ]);

        if (!isset($validated['status'])) {
            $validated['status'] = 'ACTIVE';
        }

        $department = Department::create($validated);
        ActivityLog::create([
            'user_id' => 1,
            'action' => 'department.create',
            'entity_type' => 'department',
            'entity_id' => $department->id,
            'ip_address' => $request->ip(),
            'details' => $department->name,
        ]);
        return response()->json(['department' => $department, 'success' => 'Department added successfully!'], 201);
    }

    public function update(Request $request, int $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:departments,name,' . $department->id,
            'status' => 'sometimes|required|in:ACTIVE,INACTIVE',
            'is_default' => 'sometimes|boolean',
        ]);

        // Prevent changing name/deleting defaults if you decide later; for now only guard delete in destroy
        $department->update($validated);
        ActivityLog::create([
            'user_id' => 1,
            'action' => 'department.update',
            'entity_type' => 'department',
            'entity_id' => $department->id,
            'ip_address' => $request->ip(),
            'details' => $department->name,
        ]);
        return response()->json(['department' => $department, 'success' => 'Department updated successfully!']);
    }

    public function destroy(int $id)
    {
        $department = Department::findOrFail($id);
        if ($department->is_default) {
            return response()->json(['message' => 'Default departments cannot be deleted.'], 422);
        }
        $name = $department->name;
        $department->delete();
        ActivityLog::create([
            'user_id' => 1,
            'action' => 'department.delete',
            'entity_type' => 'department',
            'entity_id' => $id,
            'ip_address' => request()->ip(),
            'details' => $name,
        ]);
        return response()->json(['success' => 'Department deleted successfully!']);
    }
}


