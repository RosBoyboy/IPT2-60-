<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProfileFieldsToUsers extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->nullable()->after('email');
            $table->string('department')->nullable()->after('role');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
            $table->date('joined_at')->nullable()->after('last_login_at');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'department', 'last_login_at', 'joined_at']);
        });
    }
}


