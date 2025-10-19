<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedFaculty extends Model
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
        'archived_at',
        'archived_reason'
    ];

    protected $casts = [
        'archived_at' => 'datetime'
    ];
}
