import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = false;
  errorMessage = '';

  email = '';
  role = '';
  credits = 0;

  teamName = 'Nessuna squadra assegnata';
  stadiumName = 'Nessuno stadio';
  stadiumLevel = 1;

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      this.errorMessage = 'Devi effettuare il login.';
      this.loading = false;
      return;
    }

    const userId = userData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, credits, role, team_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      this.errorMessage = profileError.message;
      this.loading = false;
      return;
    }

    this.email = profile.email;
    this.role = profile.role;
    this.credits = profile.credits ?? 0;

    if (profile.team_id) {
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', profile.team_id)
        .maybeSingle();

      this.teamName = team?.name ?? 'Nessuna squadra assegnata';
    }

    const { data: stadium } = await supabase
      .from('stadiums')
      .select('name, level')
      .eq('user_id', userId)
      .maybeSingle();

    if (stadium) {
      this.stadiumName = stadium.name ?? 'Il mio stadio';
      this.stadiumLevel = stadium.level ?? 1;
    }

    this.loading = false;
  }
}
