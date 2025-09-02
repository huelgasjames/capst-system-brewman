<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $table = 'branches';
    protected $primaryKey = 'branch_id';

    protected $fillable = [
        'branch_name',
        'location',
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
}
