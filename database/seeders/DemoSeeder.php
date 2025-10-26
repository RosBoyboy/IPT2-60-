<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Insert a couple of demo students (use only columns that exist in the base schema)
        DB::table('students')->insert([
            [
                'student_number' => 'S2025001',
                'name' => 'Juan D Santos',
                'course' => 'Computer Science',
                'year_level' => '2',
                'academic_year' => '2024-2025',
                'email' => 'juan.santos@example.com',
                'contact' => '09171234567',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_number' => 'S2025002',
                'name' => 'Maria L Garcia',
                'course' => 'Information Technology',
                'year_level' => '1',
                'academic_year' => '2024-2025',
                'email' => 'maria.garcia@example.com',
                'contact' => '09179876543',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Insert a couple of demo faculties (use only base columns)
        DB::table('faculties')->insert([
            [
                'faculty_number' => 'F2025001',
                'name' => 'Carlos A Reyes',
                'department' => 'Computer Science',
                'position' => 'Assistant Professor',
                'email' => 'carlos.reyes@example.com',
                'contact' => '09171112222',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_number' => 'F2025002',
                'name' => 'Anna M Lopez',
                'department' => 'Information Technology',
                'position' => 'Instructor',
                'email' => 'anna.lopez@example.com',
                'contact' => '09173334444',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
