import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from '../../../../sems/authentication/presentation/views/login/login';
import { LangSwitcher } from '../lang-switcher/lang-switcher';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    Login,
    LangSwitcher
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

}
