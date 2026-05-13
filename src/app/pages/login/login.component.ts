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
      this.errorMessage = this.translateAuthError(error.message);
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  async register(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { error } = await this.authService.signUp(this.email, this.password);

    this.loading = false;

    if (error) {
      this.errorMessage = this.translateAuthError(error.message);
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

  private translateAuthError(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('invalid login credentials')) {
      return 'Email o password non corretti.';
    }

    if (lower.includes('email not confirmed')) {
      return 'Devi confermare la tua email prima di accedere.';
    }

    if (lower.includes('user already registered')) {
      return 'Esiste già un account con questa email.';
    }

    if (lower.includes('password should be at least')) {
      return 'La password deve avere almeno 6 caratteri.';
    }

    return 'Si è verificato un errore. Riprova.';
  }
}
