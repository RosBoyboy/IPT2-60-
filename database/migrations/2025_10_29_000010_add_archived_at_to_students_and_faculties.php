<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddArchivedAtToStudentsAndFaculties extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('students', 'archived_at')) {
            Schema::table('students', function (Blueprint $table) {
                $table->timestamp('archived_at')->nullable()->after('status');
                $table->index('archived_at');
            });
        }

        if (!Schema::hasColumn('faculties', 'archived_at')) {
            Schema::table('faculties', function (Blueprint $table) {
                $table->timestamp('archived_at')->nullable()->after('status');
                $table->index('archived_at');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('students', 'archived_at')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropIndex(['archived_at']);
                $table->dropColumn('archived_at');
            });
        }

        if (Schema::hasColumn('faculties', 'archived_at')) {
            Schema::table('faculties', function (Blueprint $table) {
                $table->dropIndex(['archived_at']);
                $table->dropColumn('archived_at');
            });
        }
    }
}


