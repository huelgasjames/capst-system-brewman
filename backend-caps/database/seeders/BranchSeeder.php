<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample branches
        Branch::create([
            'branch_name' => 'Main Branch',
            'location' => '123 Coffee Street, Downtown',
        ]);

        Branch::create([
            'branch_name' => 'Mall Branch',
            'location' => '456 Shopping Mall, Westside',
        ]);

        Branch::create([
            'branch_name' => 'University Branch',
            'location' => '789 Campus Road, University District',
        ]);
    }
}
