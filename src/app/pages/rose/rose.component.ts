import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Team = {
  name: string;
  players: string[];
};

type Season = {
  label: string;
  value: string;
  teams: Team[];
};

@Component({
  selector: 'app-rose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rose.component.html',
  styleUrl: './rose.component.scss',
})
export class RoseComponent {
  selectedSeason = '2025-2026';

  seasons: Season[] = [
    {
      label: 'Stagione 2025/2026',
      value: '2025-2026',
      teams: [
        {
          name: 'Real Manager',
          players: [
            'Portiere Placeholder',
            'Difensore Placeholder',
            'Centrocampista Placeholder',
            'Attaccante Placeholder',
          ],
        },
        {
          name: 'FC Placeholder',
          players: [
            'Portiere Demo',
            'Difensore Demo',
            'Centrocampista Demo',
            'Attaccante Demo',
          ],
        },
      ],
    },
    {
      label: 'Stagione 2024/2025',
      value: '2024-2025',
      teams: [
        {
          name: 'Atletico Budget',
          players: [
            'Portiere Storico',
            'Difensore Storico',
            'Centrocampista Storico',
            'Attaccante Storico',
          ],
        },
        {
          name: 'Dinamo Crediti',
          players: [
            'Portiere 24/25',
            'Difensore 24/25',
            'Centrocampista 24/25',
            'Attaccante 24/25',
          ],
        },
      ],
    },
  ];

  get currentSeason(): Season {
    return (
      this.seasons.find((season) => season.value === this.selectedSeason) ??
      this.seasons[0]
    );
  }
}
