<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $primaryKey = 'customer_id';

    protected $fillable = ['name', 'email', 'phone', 'loyalty_points'];

    public function sales()
    {
        return $this->hasMany(Sale::class, 'customer_id', 'customer_id');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'customer_id', 'customer_id');
    }
}
