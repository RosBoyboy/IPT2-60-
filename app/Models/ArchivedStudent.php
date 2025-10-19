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
        'archived_at',
        'archived_reason'
    ];

    protected $casts = [
        'archived_at' => 'datetime'
    ];
}