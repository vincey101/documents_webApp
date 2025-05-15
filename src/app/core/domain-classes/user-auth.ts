import { Claim } from './claim';

export class UserAuth {
  isAuthenticated = false;
  authorisation: Authorisation;
  user: User;
  claims: string[] = [];
  status: string;
  tokenTime: Date;
}

export class Authorisation {
  token: string;
  type: string;
}

export class User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  phoneNumber?: string;
}
