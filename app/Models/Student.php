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
        'course',
        'course_id',
        'year_level',
        'academic_year',
        'email',
        'contact',
        'status',
        // Additional personal and contact details
        'gender',
        'dob',
        'age',
        'street_address',
        'city_municipality',
        'province_region',
        'zip_code',
        'archived_at',
    ];

    public function courseRelation()
    {
        return $this->belongsTo(\App\Models\Course::class, 'course_id');
    }
}
