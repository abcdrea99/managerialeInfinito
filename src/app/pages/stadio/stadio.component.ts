import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Stadium = {
  level: number;
  name: string;
  image: string;
  capacity: number;
  income: number;
  unlocked: boolean;
};

@Component({
  selector: 'app-stadio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stadio.component.html',
  styleUrl: './stadio.component.scss',
})
export class StadioComponent {
  currentLevel = 1;

  stadiums: Stadium[] = [
    {
      level: 1,
      name: 'Stadio Comunale',
      image: 'assets/images/stadi/stadio-livello-1.png',
      capacity: 8000,
      income: 50000,
      unlocked: true,
    },
    {
      level: 2,
      name: 'Arena Cittadina',
      image: 'assets/images/stadi/stadio-livello-2.png',
      capacity: 18000,
      income: 120000,
      unlocked: false,
    },
    {
      level: 3,
      name: 'Stadio Élite',
      image: 'assets/images/stadi/stadio-livello-3.png',
      capacity: 45000,
      income: 300000,
      unlocked: false,
    },
    {
      level: 4,
      name: 'Stadio Élite',
      image: 'assets/images/stadi/stadio-livello-4.png',
      capacity: 45000,
      income: 300000,
      unlocked: false,
    },
    {
      level: 5,
      name: 'Stadio Élite',
      image: 'assets/images/stadi/stadio-livello-5.png',
      capacity: 45000,
      income: 300000,
      unlocked: false,
    },
    {
      level: 6,
      name: 'Stadio Élite',
      image: 'assets/images/stadi/stadio-livello-6.png',
      capacity: 45000,
      income: 300000,
      unlocked: false,
    },
  ];

  get currentStadium(): Stadium {
    return (
      this.stadiums.find((s) => s.level === this.currentLevel) ??
      this.stadiums[0]
    );
  }
}
