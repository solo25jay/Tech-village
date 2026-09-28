export type RoleName = 'learner' | 'mentor' | 'professional' | 'company' | 'admin' | 'super_admin';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
}
