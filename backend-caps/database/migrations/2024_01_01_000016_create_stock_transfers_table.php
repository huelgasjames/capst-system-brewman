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
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id('transfer_id');
            $table->string('transfer_number')->unique();
            $table->integer('from_branch_id');
            $table->integer('to_branch_id');
            $table->enum('status', [
                'pending',
                'approved',
                'in_transit',
                'completed',
                'cancelled',
                'rejected'
            ])->default('pending');
            $table->date('request_date');
            $table->date('approved_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('requested_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamps();

            $table->foreign('from_branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('to_branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('requested_by')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('user_id')->on('users')->onDelete('set null');
            $table->index(['from_branch_id', 'to_branch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');
    }
};
