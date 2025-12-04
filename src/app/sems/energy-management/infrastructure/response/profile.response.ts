export interface ProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  profilePhotoUrl?: string | null;
}
