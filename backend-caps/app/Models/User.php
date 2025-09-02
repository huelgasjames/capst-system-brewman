<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /**
     * The primary key for the model (database uses user_id instead of id).
     */
    protected $primaryKey = 'user_id';

    /**
     * Disable default Laravel timestamps as the table has no updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'branch_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
