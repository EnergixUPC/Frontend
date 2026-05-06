import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { User } from '../../../../authentication/domain/model/entities/user.entity';
import { ProfileService } from '../../../application/services/profile.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profilePhotoUrl: string | null = null;
  isLoading = true;
  photoError: string | null = null;
  editableProfile: Partial<User> = {};

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    console.log('ProfileComponent - Iniciando carga de perfil...');

    // Obtener el usuario del AuthService
    this.user = this.authService.getCurrentUser();
    console.log('ProfileComponent - Usuario actual:', this.user);

    if (this.user) {
      // Cargar datos del perfil desde el backend
      this.loadProfileFromBackend();
    } else {
      console.log('ProfileComponent - No hay usuario autenticado');
      this.isLoading = false;
    }
  }

  private loadProfileFromBackend(): void {
    console.log('ProfileComponent - Cargando perfil desde backend...');

    this.profileService.loadUserProfile('me').subscribe({
      next: (profile) => {
        console.log('ProfileComponent - Perfil cargado:', profile);

        this.editableProfile = {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          address: profile.address,
          profilePhotoUrl: profile.profilePhotoUrl
        };
        this.profilePhotoUrl = profile.profilePhotoUrl || null;

        if (this.user && profile.profilePhotoUrl) {
          const updatedUser = this.buildUpdatedUser(this.user, profile.profilePhotoUrl);
          this.authService.updateCurrentUser(updatedUser);
          console.log('ProfileComponent - User actualizado con foto del perfil');
        }

        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 50);
      },
      error: (error) => {
        console.error('ProfileComponent - Error cargando perfil:', error);

        // Si el perfil no existe (404), usar los datos del usuario para inicializarlo
        if (error?.status === 404 && this.user) {
          console.log('ProfileComponent - Perfil no encontrado, inicializando con datos del usuario');
          this.editableProfile = {
            id: this.user.id,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            email: this.user.email,
            phoneNumber: this.user.phoneNumber,
            address: this.user.address,
            profilePhotoUrl: this.user.profilePhotoUrl
          };
          this.profilePhotoUrl = this.user.profilePhotoUrl || null;
        }
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 50);
      }
    });
  }

  getInitials(): string {
    const first = (this.editableProfile.firstName || '').charAt(0).toUpperCase();
    const last = (this.editableProfile.lastName || '').charAt(0).toUpperCase();
    return first + last || '?';
  }

  onImageError(): void {
    this.profilePhotoUrl = null;
    this.cdr.detectChanges();
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return false;
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)(\?.*)?$/i;
      const imageHosts = [
        'postimg.cc', 'i.postimg.cc', 'imgur.com', 'i.imgur.com',
        'cloudinary.com', 'unsplash.com', 'images.unsplash.com',
        'pexels.com', 'images.pexels.com', 'googleusercontent.com',
        'githubusercontent.com', 'gravatar.com'
      ];
      const hasImageExtension = imageExtensions.test(parsed.pathname);
      const isKnownHost = imageHosts.some(host => parsed.hostname.endsWith(host));
      return hasImageExtension || isKnownHost;
    } catch {
      return false;
    }
  }

  changePhoto(): void {
    this.photoError = null;
    const promptText = this.translate.instant('profile.photoUrlPrompt');
    const errorText = this.translate.instant('profile.photoUrlError');

    const photoUrl = prompt(promptText, this.profilePhotoUrl || '');
    if (photoUrl === null) return;

    const trimmed = photoUrl.trim();
    if (!trimmed) return;

    if (!this.isValidImageUrl(trimmed)) {
      this.photoError = errorText;
      this.cdr.detectChanges();
      setTimeout(() => { this.photoError = null; this.cdr.detectChanges(); }, 4000);
      return;
    }

    this.savePhoto(trimmed);
  }

  removePhoto(): void {
    this.photoError = null;
    this.savePhoto('');
  }

  private savePhoto(photoUrl: string): void {
    this.profilePhotoUrl = photoUrl || null;
    this.editableProfile = { ...this.editableProfile, profilePhotoUrl: photoUrl || undefined };

    if (!this.user) return;

    const profileResource = {
      id: this.editableProfile.id || '',
      email: this.editableProfile.email || '',
      firstName: this.editableProfile.firstName || '',
      lastName: this.editableProfile.lastName || '',
      phoneNumber: this.editableProfile.phoneNumber,
      address: this.editableProfile.address,
      profilePhotoUrl: photoUrl || undefined
    };

    const updatedUser = this.buildUpdatedUser(this.user, photoUrl || undefined);
    this.authService.updateCurrentUser(updatedUser);
    this.cdr.detectChanges();

    this.profileService.updateProfile('me', profileResource).subscribe({
      error: () => {
        //User already updated locally, silent fail
      }
    });
  }

  private buildUpdatedUser(user: User, photoUrl?: string): User {
    return new User(
      user.id, user.email, user.firstName, user.lastName,
      user.role, user.isActive, user.createdAt, user.lastLogin,
      user.username, user.phoneNumber, user.address, photoUrl
    );
  }
}
