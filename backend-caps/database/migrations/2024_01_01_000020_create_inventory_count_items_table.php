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
        Schema::create('inventory_count_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->unsignedBigInteger('count_id');
            $table->unsignedBigInteger('product_id');
            $table->integer('system_quantity');
            $table->integer('counted_quantity');
            $table->integer('variance');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('count_id')->references('count_id')->on('inventory_counts')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->index(['count_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_count_items');
    }
};
