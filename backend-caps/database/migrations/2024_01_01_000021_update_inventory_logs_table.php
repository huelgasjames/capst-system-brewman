<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            // Update the change_type enum to include new types
            $table->enum('change_type', [
                'in', 
                'out', 
                'adjustment', 
                'sale', 
                'return',
                'restock',
                'waste',
                'transfer_in',
                'transfer_out'
            ])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->enum('change_type', [
                'in', 
                'out', 
                'adjustment', 
                'sale', 
                'return'
            ])->change();
        });
    }
};
