<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_number',
        'name',
        'family_name',
        'given_name',
        'middle_name',
        'date_of_birth',
        'gender',
        'marital_status',
        'department',
        'position',
        'hire_date',
        'education',
        'specialization',
        'address',
        'contact',
        'email',
        'languages',
        'additional_info',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
    ];
}
