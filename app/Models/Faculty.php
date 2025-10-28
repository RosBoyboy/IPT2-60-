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
        'department',
        'position',
        'email',
        'contact',
        'status',
        'gender',
        'dob',
        'age',
        'street',
        'city',
        'province',
        'zip_code',
    ];
}
