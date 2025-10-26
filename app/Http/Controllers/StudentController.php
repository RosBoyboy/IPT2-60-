<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\ArchivedStudent;
use Illuminate\Http\Request;

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
            'family_name'    => 'nullable|string|max:255',
            'given_name'     => 'nullable|string|max:255',
            'middle_name'    => 'nullable|string|max:255',
            'date_of_birth'  => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'gender'         => 'nullable|string|max:50',
            'blood_type'     => 'nullable|string|max:10',
            'height'         => 'nullable|string|max:50',
            'civil_status'   => 'nullable|string|max:50',
            'religion'       => 'nullable|string|max:255',
            'citizenship'    => 'nullable|string|max:255',
            'address'        => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'languages'      => 'nullable|string|max:500',
            'course'         => 'required|string|max:255',
            'classification' => 'nullable|string|max:255',
            'year_level'     => 'required|string|max:50',
            'academic_year'  => 'required|string|max:50',
            'father_name'    => 'nullable|string|max:255',
            'mother_name'    => 'nullable|string|max:255',
            'guardian_name'  => 'nullable|string|max:255',
            'guardian_contact'=> 'nullable|string|max:50',
            'additional_info'=> 'nullable|string',
            'status'         => 'required|in:ACTIVE,INACTIVE',
        ]);

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
            'family_name'    => 'nullable|string|max:255',
            'given_name'     => 'nullable|string|max:255',
            'middle_name'    => 'nullable|string|max:255',
            'date_of_birth'  => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'gender'         => 'nullable|string|max:50',
            'blood_type'     => 'nullable|string|max:10',
            'height'         => 'nullable|string|max:50',
            'civil_status'   => 'nullable|string|max:50',
            'religion'       => 'nullable|string|max:255',
            'citizenship'    => 'nullable|string|max:255',
            'address'        => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'languages'      => 'nullable|string|max:500',
            'course'         => 'required|string|max:255',
            'classification' => 'nullable|string|max:255',
            'year_level'     => 'required|string|max:50',
            'academic_year'  => 'required|string|max:50',
            'father_name'    => 'nullable|string|max:255',
            'mother_name'    => 'nullable|string|max:255',
            'guardian_name'  => 'nullable|string|max:255',
            'guardian_contact'=> 'nullable|string|max:50',
            'additional_info'=> 'nullable|string',
            'status'         => 'required|in:ACTIVE,INACTIVE',
        ]);

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

        // Archive the record (include demographic fields if present)
        ArchivedStudent::create([
            'student_number' => $student->student_number,
            'name' => $student->name,
            'family_name' => $student->family_name,
            'given_name' => $student->given_name,
            'middle_name' => $student->middle_name,
            'date_of_birth' => $student->date_of_birth,
            'place_of_birth' => $student->place_of_birth,
            'gender' => $student->gender,
            'blood_type' => $student->blood_type,
            'height' => $student->height,
            'civil_status' => $student->civil_status,
            'religion' => $student->religion,
            'citizenship' => $student->citizenship,
            'address' => $student->address,
            'contact_number' => $student->contact_number,
            'email' => $student->email,
            'languages' => $student->languages,
            'course' => $student->course,
            'classification' => $student->classification,
            'year_level' => $student->year_level,
            'academic_year' => $student->academic_year,
            'father_name' => $student->father_name,
            'mother_name' => $student->mother_name,
            'guardian_name' => $student->guardian_name,
            'guardian_contact' => $student->guardian_contact,
            'additional_info' => $student->additional_info,
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