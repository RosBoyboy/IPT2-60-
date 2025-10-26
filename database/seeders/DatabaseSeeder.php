<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();
        // Seed demo students and faculties for local testing
        if (class_exists(\Database\Seeders\DemoSeeder::class)) {
            $this->call(\Database\Seeders\DemoSeeder::class);
        }
    }
}
