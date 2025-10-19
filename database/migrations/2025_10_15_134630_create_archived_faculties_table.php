<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArchivedFacultiesTable extends Migration
{
    public function up()
    {
        Schema::create('archived_faculties', function (Blueprint $table) {
            $table->id();
            $table->string('faculty_number')->unique();
            $table->string('name');
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->string('email')->nullable();
            $table->string('contact')->nullable();
            $table->enum('status', ['ACTIVE','INACTIVE'])->default('ACTIVE');
            $table->timestamp('archived_at');
            $table->string('archived_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('archived_faculties');
    }
}