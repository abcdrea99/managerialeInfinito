import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  RosterPlayer,
  RosterSeason,
  RosterService,
} from '../../services/roster.service';

type TeamRoster = {
  teamName: string;
  players: RosterPlayer[];
};

@Component({
  selector: 'app-rose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rose.component.html',
  styleUrl: './rose.component.scss',
})
export class RoseComponent implements OnInit {
  seasons: RosterSeason[] = [];
  selectedSeasonId = '';

  rosters: RosterPlayer[] = [];
  groupedRosters: TeamRoster[] = [];

  loading = false;
  errorMessage = '';

  constructor(private rosterService: RosterService) {}

  async ngOnInit(): Promise<void> {
    await this.loadSeasons();
  }

  async loadSeasons(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';

      this.seasons = await this.rosterService.getSeasons();

      if (this.seasons.length > 0) {
        this.selectedSeasonId = this.seasons[0].id;
        await this.loadRosters();
      }
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Errore durante il caricamento delle stagioni.';
    } finally {
      this.loading = false;
    }
  }

  async loadRosters(): Promise<void> {
    if (!this.selectedSeasonId) {
      this.rosters = [];
      this.groupedRosters = [];
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';

      this.rosters = await this.rosterService.getRostersBySeason(
        this.selectedSeasonId,
      );

      this.groupedRosters = this.groupByTeam(this.rosters);
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Errore durante il caricamento delle rose.';
    } finally {
      this.loading = false;
    }
  }

  private groupByTeam(players: RosterPlayer[]): TeamRoster[] {
    const map = new Map<string, RosterPlayer[]>();

    players.forEach((player) => {
      const team = player.team_name?.trim() || 'Senza squadra';

      if (!map.has(team)) {
        map.set(team, []);
      }

      map.get(team)?.push(player);
    });

    return Array.from(map.entries())
      .map(([teamName, teamPlayers]) => ({
        teamName,
        players: teamPlayers.sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        ),
      }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName));
  }

  trackByTeam(index: number, team: TeamRoster): string {
    return team.teamName;
  }

  trackByPlayer(index: number, player: RosterPlayer): string {
    return player.id ?? `${player.team_name}-${player.player_name}-${index}`;
  }
}
