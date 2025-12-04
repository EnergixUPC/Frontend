export interface ProfileResource {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  fullName?: string;
}
