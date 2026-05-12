import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isSuperadmin = false;
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getUser();

    this.isLoggedIn = !!user;

    if (user) {
      const profile = await this.authService.getProfile();
      this.isSuperadmin = profile?.role === 'superadmin';
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  async logout(): Promise<void> {
    await this.authService.signOut();

    this.isLoggedIn = false;
    this.isSuperadmin = false;
    this.closeMobileMenu();

    this.router.navigate(['/login']);
  }
}
