import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

import { AdminService } from '../../services/admin.service';
import {
  HallOfFameAdminService,
  HallOfFameForm,
  HallOfFameItem,
} from '../../services/hall-of-fame-admin.service';
import {
  Regolamento,
  RegolamentoService,
} from '../../services/regolamento.service';
import {
  RosterPlayer,
  RosterSeason,
  RosterService,
} from '../../services/roster.service';

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

  hallOfFameItems: HallOfFameItem[] = [];
  hallForm: HallOfFameForm = this.getEmptyHallForm();

  rosterSeasons: RosterSeason[] = [];
  selectedRosterSeasonId = '';
  newRosterSeason = '';
  newRosterPhase = 'Primo Semestre';
  rosterPreview: RosterPlayer[] = [];
  rosterImportLoading = false;
  rosterImportMessage = '';
  rosterImportError = '';

  regolamento: Regolamento = {
    title: 'Regolamento ufficiale',
    season: '',
    content: '',
    is_active: true,
  };

  regolamentoLoading = false;
  regolamentoMessage = '';
  regolamentoError = '';

  constructor(
    private adminService: AdminService,
    private hallService: HallOfFameAdminService,
    private rosterService: RosterService,
    private regolamentoService: RegolamentoService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.checkSuperadmin();

    if (!this.accessAllowed) return;

    await Promise.all([
      this.loadData(),
      this.loadHallOfFame(),
      this.loadRosterSeasons(),
      this.loadRegolamento(),
    ]);
  }

  async checkSuperadmin(): Promise<void> {
    this.accessAllowed = await this.adminService.checkSuperadmin();

    if (!this.accessAllowed) {
      this.errorMessage = 'Accesso riservato al superadmin.';
    }
  }

  async loadData(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      await Promise.all([this.loadTeams(), this.loadUsers()]);
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Errore durante il caricamento dati.';
    } finally {
      this.loading = false;
    }
  }

  async loadUsers(): Promise<void> {
    this.users = await this.adminService.getUsers();
  }

  async loadTeams(): Promise<void> {
    this.teams = await this.adminService.getTeams();
  }

  async addTeam(): Promise<void> {
    this.clearMessages();

    const name = this.newTeamName.trim();

    if (!name) {
      this.errorMessage = 'Inserisci il nome della squadra.';
      return;
    }

    try {
      await this.adminService.addTeam(name);
      this.newTeamName = '';
      this.successMessage = 'Squadra aggiunta correttamente.';
      await this.loadData();
    } catch (error: any) {
      this.errorMessage = error?.message || 'Errore durante aggiunta squadra.';
    }
  }

  async assignTeam(user: any): Promise<void> {
    this.clearMessages();

    if (!user.selectedTeamId) {
      this.errorMessage = 'Seleziona una squadra.';
      return;
    }

    try {
      await this.adminService.assignTeam(
        user.id,
        user.team_id,
        user.selectedTeamId,
      );

      this.successMessage = 'Squadra assegnata correttamente.';
      await this.loadData();
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Errore durante assegnazione squadra.';
    }
  }

  async removeTeamFromUser(user: any): Promise<void> {
    this.clearMessages();

    if (!user.team_id) {
      this.errorMessage = 'Questo utente non ha una squadra assegnata.';
      return;
    }

    try {
      await this.adminService.removeTeamFromUser(user.id, user.team_id);
      this.successMessage = 'Squadra disassociata correttamente.';
      await this.loadData();
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Errore durante disassociazione squadra.';
    }
  }

  async deleteTeam(team: any): Promise<void> {
    this.clearMessages();

    if (team.is_assigned) {
      this.errorMessage = 'Non puoi eliminare una squadra già assegnata.';
      return;
    }

    try {
      await this.adminService.deleteTeam(team.id);
      this.successMessage = 'Squadra eliminata correttamente.';
      await this.loadData();
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Errore durante eliminazione squadra.';
    }
  }

  async updateCredits(user: any): Promise<void> {
    this.clearMessages();

    try {
      await this.adminService.updateCredits(user.id, Number(user.credits));
      this.successMessage = 'Crediti aggiornati correttamente.';
      await this.loadUsers();
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Errore durante aggiornamento crediti.';
    }
  }

  async updateUserStadium(user: any): Promise<void> {
    this.clearMessages();

    const stadiumName = user.stadiumName?.trim() || 'Stadio Comunale';
    const stadiumLevel = Number(user.stadiumLevel);

    if (!stadiumLevel || stadiumLevel < 1 || stadiumLevel > 5) {
      this.errorMessage = 'Livello stadio non valido.';
      return;
    }

    try {
      await this.adminService.updateUserStadium(
        user,
        stadiumName,
        stadiumLevel,
      );
      this.successMessage = 'Stadio aggiornato correttamente.';
      await this.loadUsers();
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Errore durante aggiornamento stadio.';
    }
  }

  async loadHallOfFame(): Promise<void> {
    try {
      this.hallOfFameItems = await this.hallService.getItems();
    } catch (error: any) {
      this.errorMessage = error?.message || 'Errore caricamento albo d’oro.';
    }
  }

  async saveHallOfFameItem(): Promise<void> {
    this.clearMessages();

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

    try {
      await this.hallService.saveItem(this.hallForm);
      this.successMessage = this.hallForm.id
        ? 'Elemento albo d’oro aggiornato.'
        : 'Elemento albo d’oro creato.';

      this.resetHallForm();
      await this.loadHallOfFame();
    } catch (error: any) {
      this.errorMessage = error?.message || 'Errore salvataggio albo d’oro.';
    }
  }

  editHallOfFameItem(item: HallOfFameItem): void {
    this.hallForm = { ...item };
  }

  async deleteHallOfFameItem(item: HallOfFameItem): Promise<void> {
    const confirmDelete = window.confirm(
      `Vuoi eliminare "${item.title}" - ${item.season}?`,
    );

    if (!confirmDelete) return;

    try {
      await this.hallService.deleteItem(item.id);
      this.successMessage = 'Elemento albo d’oro eliminato.';
      await this.loadHallOfFame();
    } catch (error: any) {
      this.errorMessage = error?.message || 'Errore eliminazione albo d’oro.';
    }
  }

  resetHallForm(): void {
    this.hallForm = this.getEmptyHallForm();
  }

  async loadRosterSeasons(): Promise<void> {
    try {
      this.rosterSeasons = await this.rosterService.getSeasons();

      if (this.rosterSeasons.length > 0 && !this.selectedRosterSeasonId) {
        this.selectedRosterSeasonId = this.rosterSeasons[0].id;
      }
    } catch (error: any) {
      this.rosterImportError =
        error?.message || 'Errore nel caricamento delle stagioni rose.';
    }
  }

  async createRosterSeason(): Promise<void> {
    this.rosterImportMessage = '';
    this.rosterImportError = '';

    if (!this.newRosterSeason.trim()) {
      this.rosterImportError = 'Inserisci la stagione, es. 2026/27.';
      return;
    }

    try {
      await this.rosterService.createSeason(
        this.newRosterSeason.trim(),
        this.newRosterPhase,
      );

      this.rosterImportMessage = 'Stagione rose creata correttamente.';
      this.newRosterSeason = '';

      await this.loadRosterSeasons();
    } catch (error: any) {
      this.rosterImportError =
        error?.message || 'Errore durante la creazione della stagione.';
    }
  }

  async onRosterFileSelected(event: Event): Promise<void> {
    this.rosterImportMessage = '';
    this.rosterImportError = '';
    this.rosterPreview = [];

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json<any>(worksheet, {
        defval: '',
      });

      this.rosterPreview = rows
        .map((row, index) => ({
          team_name: String(row['Squadra'] || '').trim(),
          player_name: String(row['Nome'] || '').trim(),
          role: String(row['Ruolo'] || '').trim(),
          quotation:
            row['Quotazione'] !== '' && row['Quotazione'] !== null
              ? Number(row['Quotazione'])
              : null,
          sort_order: index + 1,
        }))
        .filter((row) => row.team_name && row.player_name);

      if (this.rosterPreview.length === 0) {
        this.rosterImportError =
          'Nessun giocatore valido trovato. Controlla che il file abbia le colonne Squadra, Nome, Ruolo, Quotazione.';
      }
    } catch (error) {
      console.error(error);
      this.rosterImportError = 'Errore durante la lettura del file.';
    }
  }

  async saveRosterImport(): Promise<void> {
    if (!this.selectedRosterSeasonId) {
      this.rosterImportError = 'Seleziona una stagione/semestre.';
      return;
    }

    if (this.rosterPreview.length === 0) {
      this.rosterImportError = 'Carica prima un file valido.';
      return;
    }

    try {
      this.rosterImportLoading = true;
      this.rosterImportMessage = '';
      this.rosterImportError = '';

      await this.rosterService.replaceSeasonRosters(
        this.selectedRosterSeasonId,
        this.rosterPreview,
      );

      this.rosterImportMessage = 'Rose salvate correttamente.';
    } catch (error: any) {
      this.rosterImportError =
        error?.message || 'Errore durante il salvataggio delle rose.';
    } finally {
      this.rosterImportLoading = false;
    }
  }

  async loadRegolamento(): Promise<void> {
    try {
      this.regolamentoLoading = true;
      this.regolamentoError = '';
      this.regolamentoMessage = '';

      const regolamento = await this.regolamentoService.getActiveRegolamento();

      if (regolamento) {
        this.regolamento = {
          id: regolamento.id,
          title: regolamento.title,
          season: regolamento.season || '',
          content: regolamento.content,
          is_active: regolamento.is_active,
          updated_at: regolamento.updated_at,
        };
      }
    } catch (error: any) {
      this.regolamentoError =
        error?.message || 'Errore durante il caricamento del regolamento.';
    } finally {
      this.regolamentoLoading = false;
    }
  }

  async saveRegolamento(): Promise<void> {
    this.regolamentoMessage = '';
    this.regolamentoError = '';

    if (!this.regolamento.title.trim()) {
      this.regolamentoError = 'Inserisci il titolo del regolamento.';
      return;
    }

    if (!this.regolamento.content.trim()) {
      this.regolamentoError = 'Inserisci il contenuto del regolamento.';
      return;
    }

    try {
      this.regolamentoLoading = true;

      await this.regolamentoService.saveRegolamento(this.regolamento);

      this.regolamentoMessage = 'Regolamento salvato correttamente.';
      await this.loadRegolamento();
    } catch (error: any) {
      this.regolamentoError =
        error?.message || 'Errore durante il salvataggio del regolamento.';
    } finally {
      this.regolamentoLoading = false;
    }
  }

  private getEmptyHallForm(): HallOfFameForm {
    return {
      id: null,
      title: '',
      season: '',
      left_content: '',
      right_content: '',
      sort_order: 0,
    };
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
