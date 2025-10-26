<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'student_number',
        'name',
        'family_name',
        'given_name',
        'middle_name',
        'date_of_birth',
        'place_of_birth',
        'gender',
        'blood_type',
        'height',
        'civil_status',
        'religion',
        'citizenship',
        'address',
        'contact_number',
        'email',
        'languages',
        'course',
        'classification',
        'year_level',
        'academic_year',
        'father_name',
        'mother_name',
        'guardian_name',
        'guardian_contact',
        'additional_info',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];
}
