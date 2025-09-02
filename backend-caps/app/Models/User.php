<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    protected $table = 'users'; // Your DB table
    protected $primaryKey = 'user_id'; // Adjust if not "id"

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'branch_id',
    ];

    protected $hidden = [
        'password',
    ];

    // Example relation: user belongs to branch
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }
}
