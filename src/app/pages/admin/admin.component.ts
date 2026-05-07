import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminService, AdminUserRow } from '../../core/admin.service';

import { ProfileService, UserProfile } from '../../core/profile.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  profile: UserProfile | null = null;

  users: AdminUserRow[] = [];

  loading = true;

  constructor(
    private adminService: AdminService,
    private profileService: ProfileService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.profile = await this.profileService.getMyProfile();

    if (this.profile?.role !== 'superadmin') {
      this.loading = false;
      return;
    }

    this.users = await this.adminService.getAllUsers();

    this.loading = false;
  }

  async saveCredits(user: AdminUserRow): Promise<void> {
    await this.adminService.updateCredits(user.id, user.credits);
  }

  async saveTeam(user: AdminUserRow): Promise<void> {
    await this.adminService.updateTeam(user.id, user.team_name || '');
  }
}
