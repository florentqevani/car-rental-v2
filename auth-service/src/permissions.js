// src/permissions.js - Role-to-permissions mapping

const PERMISSIONS = {
    user: [
        'users:read:own',
    ],
    admin: [
        'users:read',
        'users:write',
        'users:delete',
    ],
};

/**
 * Returns the permissions array for a given role.
 * Falls back to an empty array for unknown roles.
 */
function permissionsForRole(role) {
    return PERMISSIONS[role] || [];
}

module.exports = { permissionsForRole };
