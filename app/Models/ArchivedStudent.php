<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedStudent extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_number',
        'name',
        'course',
        'year_level',
        'academic_year',
        'email',
        'contact',
        'status',
        'gender',
        'dob',
        'age',
        'street_address',
        'city_municipality',
        'province_region',
        'zip_code',
        'archived_at',
        'archived_reason'
    ];

    protected $casts = [
        'archived_at' => 'datetime'
    ];
}