import type { User } from '../types';

export type UserRole = User['role'] | string;

export function normalizeRole(role: UserRole | null | undefined) {
  return role?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? '';
}

export function hasRole(role: UserRole | null | undefined, requiredRole: UserRole) {
  return normalizeRole(role) === normalizeRole(requiredRole);
}
