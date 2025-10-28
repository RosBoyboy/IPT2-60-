<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStudentDetailsToStudentsAndArchivedStudents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('gender', 20)->nullable()->after('name');
            $table->date('dob')->nullable()->after('gender');
            $table->unsignedInteger('age')->nullable()->after('dob');
            $table->string('street_address')->nullable()->after('contact');
            $table->string('city_municipality')->nullable()->after('street_address');
            $table->string('province_region')->nullable()->after('city_municipality');
            $table->string('zip_code')->nullable()->after('province_region');
        });

        Schema::table('archived_students', function (Blueprint $table) {
            $table->string('gender', 20)->nullable()->after('name');
            $table->date('dob')->nullable()->after('gender');
            $table->unsignedInteger('age')->nullable()->after('dob');
            $table->string('street_address')->nullable()->after('contact');
            $table->string('city_municipality')->nullable()->after('street_address');
            $table->string('province_region')->nullable()->after('city_municipality');
            $table->string('zip_code')->nullable()->after('province_region');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['gender','dob','age','street_address','city_municipality','province_region','zip_code']);
        });

        Schema::table('archived_students', function (Blueprint $table) {
            $table->dropColumn(['gender','dob','age','street_address','city_municipality','province_region','zip_code']);
        });
    }
}
