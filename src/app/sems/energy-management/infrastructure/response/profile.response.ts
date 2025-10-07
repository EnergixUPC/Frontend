export interface ProfileResponse {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  address?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  createdAt?: string;
}
