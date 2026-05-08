import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../core/supabase.client';

type HallOfFameItem = {
  id: string;
  title: string;
  season: string;
  left_content: string;
  right_content: string;
  sort_order: number;
};

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

  loading = false;
  accessAllowed = false;
  errorMessage = '';
  successMessage = '';

  stadiumLevels = [1, 2, 3, 4, 5];

  async ngOnInit(): Promise<void> {
    await this.checkSuperadmin();
    await this.loadHallOfFame();

    if (this.accessAllowed) {
      await this.loadData();
    }
  }

  async checkSuperadmin(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      this.errorMessage = 'Devi effettuare il login come superadmin.';
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

    this.accessAllowed = true;
  }

  async loadData(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    await this.loadTeams();
    await this.loadUsers();

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
          name
        ),
        stadiums (
          id,
          name,
          level
        )
      `,
      )
      .order('email', { ascending: true });

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.users = (data || []).map((user: any) => {
      const stadium = Array.isArray(user.stadiums)
        ? user.stadiums[0]
        : user.stadiums;

      return {
        ...user,
        stadium,
        selectedTeamId: user.team_id,
        stadiumName: stadium?.name || 'Stadio Comunale',
        stadiumLevel: stadium?.level || 1,
      };
    });
  }

  async loadTeams(): Promise<void> {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, is_assigned')
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

    if (!name) {
      this.errorMessage = 'Inserisci il nome della squadra.';
      return;
    }

    const { error } = await supabase.from('teams').insert({
      name,
      is_assigned: false,
    });

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.newTeamName = '';
    this.successMessage = 'Squadra aggiunta correttamente.';

    await this.loadData();
  }

  async assignTeam(user: any): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!user.selectedTeamId) {
      this.errorMessage = 'Seleziona una squadra.';
      return;
    }

    const oldTeamId = user.team_id;
    const newTeamId = user.selectedTeamId;

    const { error } = await supabase
      .from('profiles')
      .update({ team_id: newTeamId })
      .eq('id', user.id);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    if (oldTeamId) {
      await supabase
        .from('teams')
        .update({ is_assigned: false })
        .eq('id', oldTeamId);
    }

    await supabase
      .from('teams')
      .update({ is_assigned: true })
      .eq('id', newTeamId);

    this.successMessage = 'Squadra assegnata correttamente.';

    await this.loadData();
  }

  async removeTeamFromUser(user: any): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!user.team_id) {
      this.errorMessage = 'Questo utente non ha una squadra assegnata.';
      return;
    }

    const oldTeamId = user.team_id;

    const { error } = await supabase
      .from('profiles')
      .update({ team_id: null })
      .eq('id', user.id);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    await supabase
      .from('teams')
      .update({ is_assigned: false })
      .eq('id', oldTeamId);

    this.successMessage = 'Squadra disassociata correttamente.';

    await this.loadData();
  }

  async deleteTeam(team: any): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (team.is_assigned) {
      this.errorMessage = 'Non puoi eliminare una squadra già assegnata.';
      return;
    }

    const { error } = await supabase.from('teams').delete().eq('id', team.id);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.successMessage = 'Squadra eliminata correttamente.';

    await this.loadData();
  }

  async updateCredits(user: any): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const { error } = await supabase
      .from('profiles')
      .update({ credits: Number(user.credits) })
      .eq('id', user.id);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.successMessage = 'Crediti aggiornati correttamente.';

    await this.loadUsers();
  }

  async updateUserStadium(user: any): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const stadiumName = user.stadiumName?.trim() || 'Stadio Comunale';
    const stadiumLevel = Number(user.stadiumLevel);

    if (!stadiumLevel || stadiumLevel < 1 || stadiumLevel > 5) {
      this.errorMessage = 'Livello stadio non valido.';
      return;
    }

    if (user.stadium?.id) {
      const { error } = await supabase
        .from('stadiums')
        .update({
          name: stadiumName,
          level: stadiumLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.stadium.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }
    } else {
      const { error } = await supabase.from('stadiums').insert({
        user_id: user.id,
        name: stadiumName,
        level: stadiumLevel,
      });

      if (error) {
        this.errorMessage = error.message;
        return;
      }
    }

    this.successMessage = 'Stadio aggiornato correttamente.';

    await this.loadUsers();
  }

  hallOfFameItems: HallOfFameItem[] = [];

  hallForm = {
    id: null as string | null,
    title: '',
    season: '',
    left_content: '',
    right_content: '',
    sort_order: 0,
  };

  async loadHallOfFame(): Promise<void> {
    const { data, error } = await supabase
      .from('hall_of_fame')
      .select('id, title, season, left_content, right_content, sort_order')
      .order('season', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.hallOfFameItems = data ?? [];
  }

  async saveHallOfFameItem(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.hallForm.title.trim()) {
      this.errorMessage = 'Inserisci il titolo.';
      return;
    }

    if (!this.hallForm.season.trim()) {
      this.errorMessage = 'Inserisci anno o stagione.';
      return;
    }

    if (!this.hallForm.left_content.trim()) {
      this.errorMessage = 'Inserisci il testo sinistra.';
      return;
    }

    if (!this.hallForm.right_content.trim()) {
      this.errorMessage = 'Inserisci il testo destra.';
      return;
    }

    const payload = {
      title: this.hallForm.title.trim(),
      season: this.hallForm.season.trim(),
      left_content: this.hallForm.left_content.trim(),
      right_content: this.hallForm.right_content.trim(),
      sort_order: Number(this.hallForm.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    if (this.hallForm.id) {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .update(payload)
        .eq('id', this.hallForm.id)
        .select();

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      if (!data || data.length === 0) {
        this.errorMessage =
          'Nessun elemento aggiornato. Controlla policy RLS o id elemento.';
        return;
      }

      this.successMessage = 'Elemento albo d’oro aggiornato.';
    } else {
      const { error } = await supabase.from('hall_of_fame').insert(payload);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.successMessage = 'Elemento albo d’oro creato.';
    }

    this.resetHallForm();
    await this.loadHallOfFame();
  }

  editHallOfFameItem(item: HallOfFameItem): void {
    this.hallForm = {
      id: item.id,
      title: item.title,
      season: item.season,
      left_content: item.left_content,
      right_content: item.right_content,
      sort_order: item.sort_order ?? 0,
    };
  }

  async deleteHallOfFameItem(item: HallOfFameItem): Promise<void> {
    const confirmDelete = window.confirm(
      `Vuoi eliminare "${item.title}" - ${item.season}?`,
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from('hall_of_fame')
      .delete()
      .eq('id', item.id);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.successMessage = 'Elemento albo d’oro eliminato.';
    await this.loadHallOfFame();
  }

  resetHallForm(): void {
    this.hallForm = {
      id: null,
      title: '',
      season: '',
      left_content: '',
      right_content: '',
      sort_order: 0,
    };
  }
}
