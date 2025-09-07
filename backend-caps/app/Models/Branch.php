<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $table = 'branches';
    protected $primaryKey = 'branch_id';
    
    // Disable timestamps since the table doesn't have updated_at column
    public $timestamps = false;

    protected $fillable = [
        'branch_name',
        'location',
        'status',
    ];

    // Relation: Branch has many users
    public function users()
    {
        return $this->hasMany(User::class, 'branch_id', 'branch_id');
    }

    // Relation: Branch has many sales
    public function sales()
    {
        return $this->hasMany(Sale::class, 'branch_id', 'branch_id');
    }

    // Get branch manager (user with role 'Branch Manager')
    public function branchManager()
    {
        return $this->hasOne(User::class, 'branch_id', 'branch_id')
                    ->where('role', 'Branch Manager');
    }

    // Get all staff assigned to this branch
    public function staff()
    {
        return $this->hasMany(User::class, 'branch_id', 'branch_id');
    }
}
