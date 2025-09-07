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
        Schema::table('users', function (Blueprint $table) {
            // Drop the existing primary key
            $table->dropPrimary(['id']);
            
            // Rename id column to user_id
            $table->renameColumn('id', 'user_id');
            
            // Add the new primary key
            $table->primary('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the current primary key
            $table->dropPrimary(['user_id']);
            
            // Rename user_id back to id
            $table->renameColumn('user_id', 'id');
            
            // Add the original primary key
            $table->primary('id');
        });
    }
};
