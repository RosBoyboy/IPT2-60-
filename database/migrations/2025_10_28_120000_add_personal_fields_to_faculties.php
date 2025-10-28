<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPersonalFieldsToFaculties extends Migration
{
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'gender')) {
                $table->string('gender')->nullable()->after('contact');
            }
            if (!Schema::hasColumn('faculties', 'dob')) {
                $table->date('dob')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('faculties', 'age')) {
                $table->integer('age')->nullable()->after('dob');
            }
            if (!Schema::hasColumn('faculties', 'street')) {
                $table->string('street')->nullable()->after('age');
            }
            if (!Schema::hasColumn('faculties', 'city')) {
                $table->string('city')->nullable()->after('street');
            }
            if (!Schema::hasColumn('faculties', 'province')) {
                $table->string('province')->nullable()->after('city');
            }
            if (!Schema::hasColumn('faculties', 'zip_code')) {
                $table->string('zip_code')->nullable()->after('province');
            }
        });

        Schema::table('archived_faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('archived_faculties', 'gender')) {
                $table->string('gender')->nullable()->after('contact');
            }
            if (!Schema::hasColumn('archived_faculties', 'dob')) {
                $table->date('dob')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('archived_faculties', 'age')) {
                $table->integer('age')->nullable()->after('dob');
            }
            if (!Schema::hasColumn('archived_faculties', 'street')) {
                $table->string('street')->nullable()->after('age');
            }
            if (!Schema::hasColumn('archived_faculties', 'city')) {
                $table->string('city')->nullable()->after('street');
            }
            if (!Schema::hasColumn('archived_faculties', 'province')) {
                $table->string('province')->nullable()->after('city');
            }
            if (!Schema::hasColumn('archived_faculties', 'zip_code')) {
                $table->string('zip_code')->nullable()->after('province');
            }
        });
    }

    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn(['gender','dob','age','street','city','province','zip_code']);
        });

        Schema::table('archived_faculties', function (Blueprint $table) {
            $table->dropColumn(['gender','dob','age','street','city','province','zip_code']);
        });
    }
}
