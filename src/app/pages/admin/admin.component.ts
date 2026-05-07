import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  teams: any[] = [];

  newTeamName = '';
  newTeamLogoUrl = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  async ngOnInit(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      this.errorMessage = 'Devi effettuare il login.';
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (error || profile?.role !== 'superadmin') {
      this.errorMessage = 'Accesso riservato al superadmin.';
      return;
    }

    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    await Promise.all([this.loadUsers(), this.loadTeams()]);

    this.loading = false;
  }

  async loadUsers(): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
      id,
      email,
      role,
      credits,
      team_id,
      teams!profiles_team_id_fkey (
        id,
        name,
        logo_url
      )
    `,
      )
      .order('email', { ascending: true });

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.users = (data || []).map((user: any) => ({
      ...user,
      selectedTeamId: user.team_id,
    }));
  }

  async loadTeams(): Promise<void> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.teams = data || [];
  }

  async addTeam(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const name = this.newTeamName.trim();
    const logoUrl = this.newTeamLogoUrl.trim();

    if (!name) {
      this.errorMessage = 'Inserisci il nome della squadra.';
      return;
    }

    const { error } = await supabase.from('teams').insert({
      name,
      logo_url: logoUrl || null,
      is_assigned: false,
    });

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.newTeamName = '';
    this.newTeamLogoUrl = '';
    this.successMessage = 'Squadra aggiunta correttamente.';

    await this.loadTeams();
  }

  async assignTeam(user: any): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!user.selectedTeamId) {
      this.errorMessage = 'Seleziona una squadra.';
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        team_id: user.selectedTeamId,
      })
      .eq('id', user.id);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    await supabase
      .from('teams')
      .update({ is_assigned: true })
      .eq('id', user.selectedTeamId);

    this.successMessage = 'Squadra assegnata correttamente.';

    await this.loadData();
  }

  async updateCredits(user: any): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const { error } = await supabase
      .from('profiles')
      .update({
        credits: Number(user.credits),
      })
      .eq('id', user.id);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.successMessage = 'Crediti aggiornati correttamente.';

    await this.loadUsers();
  }
}
