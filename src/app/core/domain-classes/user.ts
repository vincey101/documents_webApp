import { UserClaim } from './user-claim';
import { UserRoles } from './user-roles';

export interface User {
  id?: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  phoneNumber?: string;
  userRoles?: UserRoles[];
  userClaims?: UserClaim[];
  roleIds?: string[];
}
