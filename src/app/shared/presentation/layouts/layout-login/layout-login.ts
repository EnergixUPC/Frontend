import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LangSwitcher } from '../../components/lang-switcher/lang-switcher';

@Component({
  selector: 'app-layout-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LangSwitcher
  ],
  templateUrl: './layout-login.html',
  styleUrl: './layout-login.css'
})
export class LayoutLogin {

}