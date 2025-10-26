<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDemographicsToStudentsAndFaculties extends Migration
{
    public function up()
    {
        // Students table
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'family_name')) {
                $table->string('family_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('students', 'given_name')) {
                $table->string('given_name')->nullable()->after('family_name');
            }
            if (!Schema::hasColumn('students', 'middle_name')) {
                $table->string('middle_name')->nullable()->after('given_name');
            }
            if (!Schema::hasColumn('students', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('middle_name');
            }
            if (!Schema::hasColumn('students', 'place_of_birth')) {
                $table->string('place_of_birth')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('students', 'gender')) {
                $table->string('gender')->nullable()->after('place_of_birth');
            }
            if (!Schema::hasColumn('students', 'blood_type')) {
                $table->string('blood_type')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('students', 'height')) {
                $table->string('height')->nullable()->after('blood_type');
            }
            if (!Schema::hasColumn('students', 'civil_status')) {
                $table->string('civil_status')->nullable()->after('height');
            }
            if (!Schema::hasColumn('students', 'religion')) {
                $table->string('religion')->nullable()->after('civil_status');
            }
            if (!Schema::hasColumn('students', 'citizenship')) {
                $table->string('citizenship')->nullable()->after('religion');
            }
            if (!Schema::hasColumn('students', 'address')) {
                $table->string('address')->nullable()->after('citizenship');
            }
            if (!Schema::hasColumn('students', 'contact_number')) {
                $table->string('contact_number')->nullable()->after('address');
            }
            if (!Schema::hasColumn('students', 'languages')) {
                $table->string('languages')->nullable()->after('contact_number');
            }
            if (!Schema::hasColumn('students', 'classification')) {
                $table->string('classification')->nullable()->after('languages');
            }
            if (!Schema::hasColumn('students', 'father_name')) {
                $table->string('father_name')->nullable()->after('classification');
            }
            if (!Schema::hasColumn('students', 'mother_name')) {
                $table->string('mother_name')->nullable()->after('father_name');
            }
            if (!Schema::hasColumn('students', 'guardian_name')) {
                $table->string('guardian_name')->nullable()->after('mother_name');
            }
            if (!Schema::hasColumn('students', 'guardian_contact')) {
                $table->string('guardian_contact')->nullable()->after('guardian_name');
            }
            if (!Schema::hasColumn('students', 'additional_info')) {
                $table->text('additional_info')->nullable()->after('guardian_contact');
            }
        });

        // Faculties table
        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'family_name')) {
                $table->string('family_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('faculties', 'given_name')) {
                $table->string('given_name')->nullable()->after('family_name');
            }
            if (!Schema::hasColumn('faculties', 'middle_name')) {
                $table->string('middle_name')->nullable()->after('given_name');
            }
            if (!Schema::hasColumn('faculties', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('middle_name');
            }
            if (!Schema::hasColumn('faculties', 'gender')) {
                $table->string('gender')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('faculties', 'marital_status')) {
                $table->string('marital_status')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('faculties', 'hire_date')) {
                $table->date('hire_date')->nullable()->after('position');
            }
            if (!Schema::hasColumn('faculties', 'education')) {
                $table->string('education')->nullable()->after('hire_date');
            }
            if (!Schema::hasColumn('faculties', 'specialization')) {
                $table->string('specialization')->nullable()->after('education');
            }
            if (!Schema::hasColumn('faculties', 'address')) {
                $table->string('address')->nullable()->after('specialization');
            }
            if (!Schema::hasColumn('faculties', 'languages')) {
                $table->string('languages')->nullable()->after('address');
            }
            if (!Schema::hasColumn('faculties', 'additional_info')) {
                $table->text('additional_info')->nullable()->after('languages');
            }
        });

        // Archived students
        Schema::table('archived_students', function (Blueprint $table) {
            if (!Schema::hasColumn('archived_students', 'family_name')) {
                $table->string('family_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('archived_students', 'given_name')) {
                $table->string('given_name')->nullable()->after('family_name');
            }
            if (!Schema::hasColumn('archived_students', 'middle_name')) {
                $table->string('middle_name')->nullable()->after('given_name');
            }
            if (!Schema::hasColumn('archived_students', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('middle_name');
            }
            if (!Schema::hasColumn('archived_students', 'place_of_birth')) {
                $table->string('place_of_birth')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('archived_students', 'gender')) {
                $table->string('gender')->nullable()->after('place_of_birth');
            }
            if (!Schema::hasColumn('archived_students', 'blood_type')) {
                $table->string('blood_type')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('archived_students', 'height')) {
                $table->string('height')->nullable()->after('blood_type');
            }
            if (!Schema::hasColumn('archived_students', 'civil_status')) {
                $table->string('civil_status')->nullable()->after('height');
            }
            if (!Schema::hasColumn('archived_students', 'religion')) {
                $table->string('religion')->nullable()->after('civil_status');
            }
            if (!Schema::hasColumn('archived_students', 'citizenship')) {
                $table->string('citizenship')->nullable()->after('religion');
            }
            if (!Schema::hasColumn('archived_students', 'address')) {
                $table->string('address')->nullable()->after('citizenship');
            }
            if (!Schema::hasColumn('archived_students', 'contact_number')) {
                $table->string('contact_number')->nullable()->after('address');
            }
            if (!Schema::hasColumn('archived_students', 'languages')) {
                $table->string('languages')->nullable()->after('contact_number');
            }
            if (!Schema::hasColumn('archived_students', 'classification')) {
                $table->string('classification')->nullable()->after('languages');
            }
            if (!Schema::hasColumn('archived_students', 'father_name')) {
                $table->string('father_name')->nullable()->after('classification');
            }
            if (!Schema::hasColumn('archived_students', 'mother_name')) {
                $table->string('mother_name')->nullable()->after('father_name');
            }
            if (!Schema::hasColumn('archived_students', 'guardian_name')) {
                $table->string('guardian_name')->nullable()->after('mother_name');
            }
            if (!Schema::hasColumn('archived_students', 'guardian_contact')) {
                $table->string('guardian_contact')->nullable()->after('guardian_name');
            }
            if (!Schema::hasColumn('archived_students', 'additional_info')) {
                $table->text('additional_info')->nullable()->after('guardian_contact');
            }
        });

        // Archived faculties
        Schema::table('archived_faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('archived_faculties', 'family_name')) {
                $table->string('family_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('archived_faculties', 'given_name')) {
                $table->string('given_name')->nullable()->after('family_name');
            }
            if (!Schema::hasColumn('archived_faculties', 'middle_name')) {
                $table->string('middle_name')->nullable()->after('given_name');
            }
            if (!Schema::hasColumn('archived_faculties', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('middle_name');
            }
            if (!Schema::hasColumn('archived_faculties', 'gender')) {
                $table->string('gender')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('archived_faculties', 'marital_status')) {
                $table->string('marital_status')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('archived_faculties', 'hire_date')) {
                $table->date('hire_date')->nullable()->after('position');
            }
            if (!Schema::hasColumn('archived_faculties', 'education')) {
                $table->string('education')->nullable()->after('hire_date');
            }
            if (!Schema::hasColumn('archived_faculties', 'specialization')) {
                $table->string('specialization')->nullable()->after('education');
            }
            if (!Schema::hasColumn('archived_faculties', 'address')) {
                $table->string('address')->nullable()->after('specialization');
            }
            if (!Schema::hasColumn('archived_faculties', 'languages')) {
                $table->string('languages')->nullable()->after('address');
            }
            if (!Schema::hasColumn('archived_faculties', 'additional_info')) {
                $table->text('additional_info')->nullable()->after('languages');
            }
        });
    }

    public function down()
    {
        // We deliberately do not drop columns here to avoid accidental data loss.
    }
}
