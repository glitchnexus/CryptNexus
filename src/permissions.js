import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

export class PermissionManager {
  constructor() {
    this.permissions = new Map();
  }

  generatePermissionToken(userId, usage) {
    const token = nanoid(32);
    const timestamp = Date.now();
    const hash = createHash('sha256')
      .update(`${userId}:${token}:${timestamp}`)
      .digest('hex');

    this.permissions.set(hash, {
      userId,
      token,
      granted: timestamp,
      usage,
      active: true
    });

    return {
      permissionId: hash,
      token,
      expires: null // Süresiz, istediğiniz zaman iptal edebilirsiniz
    };
  }

  revokePermission(permissionId) {
    const permission = this.permissions.get(permissionId);
    if (permission) {
      permission.active = false;
      permission.revokedAt = Date.now();
      return true;
    }
    return false;
  }

  revokeAllUserPermissions(userId) {
    let count = 0;
    for (const [id, permission] of this.permissions) {
      if (permission.userId === userId) {
        permission.active = false;
        permission.revokedAt = Date.now();
        count++;
      }
    }
    return count;
  }

  validatePermission(permissionId, token) {
    const permission = this.permissions.get(permissionId);
    return permission?.active && permission?.token === token;
  }
} 