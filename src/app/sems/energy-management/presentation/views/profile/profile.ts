import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { User } from '../../../../authentication/domain/model/entities/user.entity';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslateModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profilePhotoUrl = '/assets/default-avatar.png';
  editable = false;
  isLoading = true;

  editableProfile: Partial<User> = {};

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly authService: AuthService,
    private readonly ngZone: NgZone
  ) {}


  ngOnInit(): void {
    console.log('🔍 ProfileComponent - Iniciando carga de perfil...');
    
    // DEBUG: Ver qué hay exactamente en localStorage
    console.log('🔍 DEBUG - localStorage sems_user:', localStorage.getItem('sems_user'));
    console.log('🔍 DEBUG - localStorage sems_token:', localStorage.getItem('sems_token'));
    
    // Obtener el usuario del AuthService
    this.user = this.authService.getCurrentUser();
    console.log('🔍 ProfileComponent - Usuario actual:', this.user);
    
    if (this.user) {
      this.loadUserData(this.user);
    } else {
      console.log('❌ ProfileComponent - No hay usuario, suscribiéndose a cambios de estado...');
    }
    
    // También suscribirse a cambios en el estado de autenticación
    this.authService.authState$.subscribe(authState => {
      console.log('🔍 ProfileComponent - Estado de autenticación cambió:', authState);
      
      if (authState.user && authState.user !== this.user) {
        console.log('🔍 ProfileComponent - Nuevo usuario detectado:', authState.user);
        this.user = authState.user;
        this.loadUserData(this.user);
      } else if (!authState.user) {
        console.log('❌ ProfileComponent - No hay usuario en el estado');
        this.user = null;
        this.isLoading = false;
      }
    });
  }

  private loadUserData(user: User): void {
    console.log('🔍 ProfileComponent - Cargando datos del usuario:', user);
    console.log('🔍 ProfileComponent - user.firstName:', user.firstName);
    console.log('🔍 ProfileComponent - user.lastName:', user.lastName);
    console.log('🔍 ProfileComponent - user.email:', user.email);
    console.log('🔍 ProfileComponent - user.username:', user.username);
    console.log('🔍 ProfileComponent - user.phoneNumber:', user.phoneNumber);
    console.log('🔍 ProfileComponent - user.address:', user.address);
    
    this.editableProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      address: user.address,
      profilePhotoUrl: user.profilePhotoUrl
    };
    
    console.log('🔍 ProfileComponent - editableProfile created:', this.editableProfile);
    
    this.profilePhotoUrl = user.profilePhotoUrl || '/assets/default-avatar.png';
    this.isLoading = false;
    
    console.log('🔍 ProfileComponent - isLoading set to:', this.isLoading);
  }


  onEdit(): void {
    this.editable = !this.editable;
  }

  saveChanges(): void {
    console.log('ProfileComponent - Guardando cambios:', this.editableProfile);
    
    // Por ahora solo actualizar localmente, luego se puede agregar call al backend
    if (this.user && this.editableProfile) {
      // Aquí podrías hacer una llamada al backend para actualizar el perfil
      // Por ahora solo actualizamos localmente
      this.editable = false;
      console.log('ProfileComponent - Cambios guardados localmente');
    }
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
          // No podemos modificar directamente profilePhotoUrl porque es readonly
          // Creamos un nuevo objeto para editableProfile
          this.editableProfile = {
            ...this.editableProfile,
            profilePhotoUrl: newPhoto
          };
          
          console.log('ProfileComponent - Nueva foto seleccionada');
        });
      };

      reader.readAsDataURL(file);
    }
  }
}
