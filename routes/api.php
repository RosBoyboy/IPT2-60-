<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\StudentController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Active Faculty Routes
Route::get('/faculties', [FacultyController::class, 'index']);
Route::post('/faculties', [FacultyController::class, 'store']);
Route::put('/faculties/{id}', [FacultyController::class, 'update']);
Route::delete('/faculties/{id}', [FacultyController::class, 'destroy']);

// Archive Routes
Route::get('/archived-faculties', [FacultyController::class, 'archiveIndex']);
Route::post('/archived-faculties/{id}/restore', [FacultyController::class, 'restore']);
Route::delete('/archived-faculties/{id}/force', [FacultyController::class, 'forceDelete']);

// Student Routes
Route::get('/students', [StudentController::class, 'index']);
Route::post('/students', [StudentController::class, 'store']);
Route::put('/students/{id}', [StudentController::class, 'update']);
Route::delete('/students/{id}', [StudentController::class, 'destroy']);

// Student Archive Routes
Route::get('/archived-students', [StudentController::class, 'archiveIndex']);
Route::post('/archived-students/{id}/restore', [StudentController::class, 'restore']);
Route::delete('/archived-students/{id}/force', [StudentController::class, 'forceDelete']);