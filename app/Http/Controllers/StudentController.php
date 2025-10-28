<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\ArchivedStudent;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::where('status', 'ACTIVE');

        if ($request->filled('course') && $request->course !== 'All Courses') {
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
            'course'         => 'required|string|max:255',
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

        $student = Student::create($validated);

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
            'course'         => 'required|string|max:255',
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

        $student->update($validated);

        return response()->json([
            'student' => $student,
            'success' => 'Student updated successfully!'
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        // Set status to INACTIVE
        $student->update(['status' => 'INACTIVE']);

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

        return response()->json([
            'success' => 'Student moved to inactive status and archived!'
        ]);
    }

    public function archiveIndex(Request $request)
    {
        $query = ArchivedStudent::query();

        if ($request->filled('course') && $request->course !== 'All Courses') {
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
            // Update the existing student to ACTIVE
            $student->update(['status' => 'ACTIVE']);
            
            // Delete from archived
            $archivedStudent->delete();

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
        $archivedStudent->delete();

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