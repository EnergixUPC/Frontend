import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './payment-cancel.html',
  styleUrls: ['./payment-cancel.css']
})
export class PaymentCancel implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('Payment cancelled by user');
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  tryAgain(): void {
    this.router.navigate(['plans/payments']);
  }
}

