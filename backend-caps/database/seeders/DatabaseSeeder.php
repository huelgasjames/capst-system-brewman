<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Branch;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create branches first
        $this->call([
            BranchSeeder::class,
        ]);

        // Create sample users with roles and branch assignments
        User::create([
            'name' => 'John Manager',
            'email' => 'john.manager@brewman.com',
            'password' => bcrypt('password'),
            'role' => 'Branch Manager',
            'branch_id' => 1, // Main Branch
        ]);

        User::create([
            'name' => 'Sarah Cashier',
            'email' => 'sarah.cashier@brewman.com',
            'password' => bcrypt('password'),
            'role' => 'Cashier',
            'branch_id' => 1, // Main Branch
        ]);

        User::create([
            'name' => 'Mike Barista',
            'email' => 'mike.barista@brewman.com',
            'password' => bcrypt('password'),
            'role' => 'Barista',
            'branch_id' => 1, // Main Branch
        ]);

        User::create([
            'name' => 'Lisa Manager',
            'email' => 'lisa.manager@brewman.com',
            'password' => bcrypt('password'),
            'role' => 'Branch Manager',
            'branch_id' => 2, // Mall Branch
        ]);

        User::create([
            'name' => 'David Cashier',
            'email' => 'david.cashier@brewman.com',
            'password' => bcrypt('password'),
            'role' => 'Cashier',
            'branch_id' => 2, // Mall Branch
        ]);
    }
}
