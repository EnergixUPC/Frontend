import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { LangSwitcher } from '../../components/lang-switcher/lang-switcher';

@Component({
  selector: 'app-layout-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Sidebar,
    LangSwitcher
  ],
  templateUrl: './layout-home.html',
  styleUrl: './layout-home.css'
})
export class LayoutHome {

}
