<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Course;
use App\Models\ArchivedStudent;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::where('status', 'ACTIVE');

        // Support filtering by course_id (preferred) or fallback to course name
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        } else if ($request->filled('course') && $request->course !== 'All Courses') {
            $query->where('course', $request->course);
        }
        if ($request->filled('year_level') && $request->year_level !== 'All Years') {
            $query->where('year_level', $request->year_level);
        }
        if ($request->filled('status') && $request->status !== 'All Status') {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('student_number', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $students = $query->orderBy('id')->get();

        return response()->json(['students' => $students]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_number' => 'required|string|max:50|unique:students,student_number',
            'name'           => 'required|string|max:255',
            'course'         => 'nullable|string|max:255',
            'course_id'      => 'nullable|integer|exists:courses,id',
            'year_level'     => 'required|string|max:50',
            'academic_year'  => 'required|string|max:50',
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

        // If dob provided, compute age server-side to ensure correctness
        if (!empty($validated['dob'])) {
            try {
                $validated['age'] = Carbon::parse($validated['dob'])->age;
            } catch (\Exception $e) {
                // ignore parse issues, age will remain as provided or null
            }
        }

        // If course_id provided, resolve and set course name for backward compatibility
        if (!empty($validated['course_id'])) {
            $c = Course::find($validated['course_id']);
            if ($c) {
                $validated['course'] = $c->name;
            }
        }

        $student = Student::create($validated);

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'student.create',
            'entity_type' => 'student',
            'entity_id' => $student->id,
            'ip_address' => $request->ip(),
            'details' => $student->student_number,
        ]);

        return response()->json([
            'student' => $student,
            'success' => 'Student added successfully!'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'student_number' => 'required|string|max:50|unique:students,student_number,' . $student->id,
            'name'           => 'required|string|max:255',
            'course'         => 'nullable|string|max:255',
            'course_id'      => 'nullable|integer|exists:courses,id',
            'year_level'     => 'required|string|max:50',
            'academic_year'  => 'required|string|max:50',
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

        // If course_id provided, resolve name for backward compatibility
        if (!empty($validated['course_id'])) {
            $c = Course::find($validated['course_id']);
            if ($c) {
                $validated['course'] = $c->name;
            }
        }

        $student->update($validated);

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'student.update',
            'entity_type' => 'student',
            'entity_id' => $student->id,
            'ip_address' => $request->ip(),
            'details' => $student->student_number,
        ]);

        return response()->json([
            'student' => $student,
            'success' => 'Student updated successfully!'
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        // Set status to INACTIVE and mark archived timestamp
        $student->update(['status' => 'INACTIVE', 'archived_at' => now()]);

        // Archive the record
        ArchivedStudent::create([
            'student_number' => $student->student_number,
            'name' => $student->name,
            'course' => $student->course,
            'year_level' => $student->year_level,
            'academic_year' => $student->academic_year,
            'email' => $student->email,
            'contact' => $student->contact,
            'gender' => $student->gender,
            'dob' => $student->dob,
            'age' => $student->age,
            'street_address' => $student->street_address,
            'city_municipality' => $student->city_municipality,
            'province_region' => $student->province_region,
            'zip_code' => $student->zip_code,
            'status' => 'INACTIVE',
            'archived_at' => now(),
            'archived_reason' => 'Moved to inactive status'
        ]);

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'student.archive',
            'entity_type' => 'student',
            'entity_id' => $student->id,
            'ip_address' => $request->ip(),
            'details' => $student->student_number,
        ]);

        return response()->json([
            'success' => 'Student moved to inactive status and archived!'
        ]);
    }

    public function archiveIndex(Request $request)
    {
        $query = ArchivedStudent::query();

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        } else if ($request->filled('course') && $request->course !== 'All Courses') {
            $query->where('course', $request->course);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('student_number', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $archivedStudents = $query->orderBy('archived_at', 'desc')->get();

        return response()->json(['archived_students' => $archivedStudents]);
    }

    public function restore($id)
    {
        $archivedStudent = ArchivedStudent::findOrFail($id);

        // Find the original student record
        $student = Student::where('student_number', $archivedStudent->student_number)->first();

        if ($student) {
            // Update the existing student to ACTIVE and clear archived timestamp
            $student->update(['status' => 'ACTIVE', 'archived_at' => null]);
            
            // Delete from archived
            $archivedStudent->delete();

            ActivityLog::create([
                'user_id' => 1,
                'action' => 'student.restore',
                'entity_type' => 'student',
                'entity_id' => $student->id,
                'ip_address' => $request->ip(),
                'details' => $student->student_number,
            ]);

            return response()->json([
                'student' => $student,
                'success' => 'Student restored successfully!'
            ]);
        }

        return response()->json([
            'error' => 'Original student record not found.'
        ], 404);
    }

    public function forceDelete($id)
    {
        $archivedStudent = ArchivedStudent::findOrFail($id);

        // Also remove the original record from students table if it exists
        $student = Student::where('student_number', $archivedStudent->student_number)->first();
        if ($student) {
            $student->delete();
        }

        // Remove from archived table
        $archivedStudent->delete();

        ActivityLog::create([
            'user_id' => 1,
            'action' => 'student.force_delete',
            'entity_type' => 'student',
            'entity_id' => $id,
            'ip_address' => request()->ip(),
            'details' => $archivedStudent->student_number,
        ]);

        return response()->json([
            'success' => 'Archived student permanently deleted!'
        ]);
    }

    // Other methods remain the same...
    public function create()
    {
        //
    }

    public function show(Student $student)
    {
        //
    }

    public function edit(Student $student)
    {
        //
    }
}