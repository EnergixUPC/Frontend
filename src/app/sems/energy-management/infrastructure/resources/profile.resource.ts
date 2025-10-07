export interface ProfileResource {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  address?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  createdAt?: Date;
  fullName?: string;
}
