<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::view('/', 'profilemanagement');

// Protect dashboard shell with CSRF-on-GET middleware
Route::view('/dashboard/{any?}', 'profilemanagement')
    ->where('any', '.*')
    ->middleware('csrf.get');

// Catch-all for other non-api routes
Route::view('/{any}', 'profilemanagement')->where('any', '^(?!api|dashboard).*$');
