<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\ActivityLog;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $courses = $query->orderBy('name')->get();
        return response()->json(['courses' => $courses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:courses,name',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'is_default' => 'nullable|boolean',
        ]);

        if (!isset($validated['status'])) {
            $validated['status'] = 'ACTIVE';
        }

        $course = Course::create($validated);
        ActivityLog::create([
            'user_id' => 1,
            'action' => 'course.create',
            'entity_type' => 'course',
            'entity_id' => $course->id,
            'ip_address' => $request->ip(),
            'details' => $course->name,
        ]);
        return response()->json(['course' => $course, 'success' => 'Course added successfully!'], 201);
    }

    public function update(Request $request, int $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:courses,name,' . $course->id,
            'status' => 'sometimes|required|in:ACTIVE,INACTIVE',
            'is_default' => 'sometimes|boolean',
        ]);

        $course->update($validated);
        ActivityLog::create([
            'user_id' => 1,
            'action' => 'course.update',
            'entity_type' => 'course',
            'entity_id' => $course->id,
            'ip_address' => $request->ip(),
            'details' => $course->name,
        ]);
        return response()->json(['course' => $course, 'success' => 'Course updated successfully!']);
    }

    public function destroy(int $id)
    {
        $course = Course::findOrFail($id);
        if ($course->is_default) {
            return response()->json(['message' => 'Default courses cannot be deleted.'], 422);
        }
        $name = $course->name;
        $course->delete();
        ActivityLog::create([
            'user_id' => 1,
            'action' => 'course.delete',
            'entity_type' => 'course',
            'entity_id' => $id,
            'ip_address' => request()->ip(),
            'details' => $name,
        ]);
        return response()->json(['success' => 'Course deleted successfully!']);
    }
}
