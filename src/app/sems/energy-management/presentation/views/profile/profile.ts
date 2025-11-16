import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ProfileStore } from '../../../application/state/profile.store';
import { ProfileService } from '../../../application/services/profile.service';
import { ProfileResource } from '../../../infrastructure/resources/profile.resource';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslatePipe, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile$: Observable<ProfileResource | null>;
  profilePhotoUrl = '/assets/default-avatar.png';
  editable = false;

  editableProfile: Partial<ProfileResource> = {};

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly ngZone: NgZone
  ) {
    this.profile$ = this.profileStore.profile$;
  }


  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('sems_token');
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      console.log('Payload del token:', payload);

      // Primero buscar userId, luego id, y finalmente sub
      const userId = payload.userId || payload.id;

      if (userId) {
        return String(userId);
      }

      return null;
    } catch (e) {
      console.error('Error decodificando token:', e);
      return null;
    }
  }
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Usuario actual completo:', currentUser);

    // Obtener ID del token si currentUser.id es 0 o undefined
    let userId: string | undefined = currentUser?.id;

    if (!userId || userId === '0' || (typeof userId === 'number' && userId === 0)) {
      console.log(' ID inválido, obteniendo del token...');
      const tokenId = this.getUserIdFromToken();
      if (tokenId) {
        userId = tokenId;
      }
    }

    console.log(' ID final a usar:', userId);

    if (userId) {
      const id = typeof userId === 'number' ? String(userId) : userId;
      this.profileService.loadUserProfile(id).subscribe({
        next: () => {
          const user = this.profileStore.currentProfile;
          if (user) {
            this.profilePhotoUrl = user.profilePhotoUrl || this.profilePhotoUrl;
            this.editableProfile = { ...user };
          }
        },
        error: err => console.error('Error', err)
      });
    } else {
      console.error(' No se pudo obtener el ID del usuario');
    }

    this.profile$.subscribe(p => {
      if (p && !this.editableProfile.profilePhotoUrl?.startsWith('data:image')) {
        this.profilePhotoUrl = p.profilePhotoUrl || this.profilePhotoUrl;
        this.editableProfile = { ...p };
      }
    });
  }


  onEdit(): void {
    this.editable = !this.editable;
  }
  saveChanges(): void {
    if (!this.editableProfile.id) {
      console.error('No se puede guardar: falta el ID del perfil');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const tokenUserId = this.getUserIdFromToken();


  this.editable = false;

    this.profileService.updateProfile(
      this.editableProfile.id,
      this.editableProfile as ProfileResource
    ).subscribe({
      next: (updatedProfile) => {
        console.log('Perfil actualizado correctamente:', updatedProfile);
        this.editableProfile = { ...updatedProfile };
      },
      error: (err) => {
        console.error('Error completo:', err);
        console.error('Status:', err.status);
        console.error('Mensaje:', err.error);
        this.editable = true;
      }
    });
  }


  changePhoto(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.ngZone.run(() => {
          const newPhoto = reader.result as string;
          this.profilePhotoUrl = newPhoto;
          this.editableProfile.profilePhotoUrl = newPhoto;

          this.profileStore.updateActiveProfile(this.editableProfile as ProfileResource);
          console.log('');
        });
      };

      reader.readAsDataURL(file);
    }
  }
}
