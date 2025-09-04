<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    protected $table = 'admins';
    protected $primaryKey = 'admin_id';
    
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Check if admin has super admin role
     */
    public function isSuperAdmin()
    {
        return $this->role === 'Super Admin';
    }

    /**
     * Check if admin has owner role
     */
    public function isOwner()
    {
        return $this->role === 'Owner';
    }

    /**
     * Check if admin has any admin role
     */
    public function isAdmin()
    {
        return in_array($this->role, ['Super Admin', 'Owner', 'Admin']);
    }
}
