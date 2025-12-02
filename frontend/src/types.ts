export type UserRole = 'instructor' | 'aprendiz' | 'admin';

export interface User {
  username: string;
  password: string;
  role: UserRole;
  name: string;
}