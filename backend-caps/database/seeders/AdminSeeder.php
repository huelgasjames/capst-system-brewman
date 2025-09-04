<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        Admin::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@brewman.com',
            'password' => Hash::make('admin123'),
            'role' => 'Super Admin',
        ]);

        // Create Owner
        Admin::create([
            'name' => 'Owner',
            'email' => 'owner@brewman.com',
            'password' => Hash::make('owner123'),
            'role' => 'Owner',
        ]);
    }
}
