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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id('adjustment_id');
            $table->string('adjustment_number')->unique();
            $table->integer('branch_id');
            $table->unsignedBigInteger('product_id');
            $table->enum('adjustment_type', ['increase', 'decrease']);
            $table->integer('quantity');
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('adjusted_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->date('adjustment_date');
            $table->timestamps();

            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->foreign('adjusted_by')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('user_id')->on('users')->onDelete('set null');
            $table->index(['branch_id', 'product_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
