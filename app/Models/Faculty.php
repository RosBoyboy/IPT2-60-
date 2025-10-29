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
}
