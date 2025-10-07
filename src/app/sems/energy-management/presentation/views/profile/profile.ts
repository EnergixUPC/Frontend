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

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      const id = typeof currentUser.id === 'number' ? String(currentUser.id) : currentUser.id;
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
    this.editable = false;
    console.log('', this.editableProfile);
    this.profileStore.updateActiveProfile(this.editableProfile as ProfileResource);
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
