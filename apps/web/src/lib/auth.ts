import {
  ROLE_PORTAL_MAP,
  PORTAL_HOME_PATHS,
  PortalType,
  HOTEL_ROLES,
  POLICE_ROLES,
  ADMIN_ROLES,
} from '@hms/shared';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  mfaEnabled?: boolean;
}

export function saveSession(accessToken: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getPortalForRole(role: string): PortalType {
  return ROLE_PORTAL_MAP[role] || PortalType.POLICE;
}

export function getHomeForRole(role: string): string {
  return PORTAL_HOME_PATHS[getPortalForRole(role)];
}

export function isHotelRole(role: string) {
  return (HOTEL_ROLES as readonly string[]).includes(role);
}

export function isPoliceRole(role: string) {
  return (POLICE_ROLES as readonly string[]).includes(role);
}

export function isAdminRole(role: string) {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function canAccessPortal(role: string, portal: PortalType): boolean {
  if (portal === PortalType.SUPER_ADMIN) return role === 'super_admin';
  if (portal === PortalType.ADMIN) return role === 'super_admin' || role === 'police_command';
  if (portal === PortalType.HOTEL) return isHotelRole(role);
  if (portal === PortalType.POLICE) return isPoliceRole(role) || role === 'super_admin';
  return false;
}

export function redirectAfterLogin(role: string, intendedPortal?: PortalType): string {
  if (intendedPortal && canAccessPortal(role, intendedPortal)) {
    return PORTAL_HOME_PATHS[intendedPortal];
  }
  return getHomeForRole(role);
}
