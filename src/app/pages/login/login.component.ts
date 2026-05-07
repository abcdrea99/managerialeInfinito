import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  isRegisterMode = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async login(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { error } = await this.authService.signIn(this.email, this.password);

    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.router.navigate(['/stadio']);
  }

  async register(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { error } = await this.authService.signUp(this.email, this.password);

    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.successMessage =
      'Registrazione completata. Ora attendi che il superadmin ti assegni una squadra.';

    this.isRegisterMode = false;
    this.password = '';
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
