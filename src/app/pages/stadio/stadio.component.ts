import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type StadiumLevel = {
  level: number;
  defaultName: string;
  image: string;
  capacity: number;
  income: number;
  upgradeCost: number | null;
  homeBonus: {
    win: number;
    draw: number;
    loss: number;
  };
};

@Component({
  selector: 'app-stadio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stadio.component.html',
  styleUrl: './stadio.component.scss',
})
export class StadioComponent {
  currentLevel = Number(localStorage.getItem('stadiumLevel')) || 1;

  stadiumName = localStorage.getItem('stadiumName') || 'Il mio stadio';

  stadiums: StadiumLevel[] = [
    {
      level: 1,
      defaultName: 'Stadio Comunale',
      image: 'assets/images/stadi/stadio-livello-1.png',
      capacity: 10000,
      income: 50000,
      upgradeCost: null,
      homeBonus: { win: 2, draw: 1, loss: 0 },
    },
    {
      level: 2,
      defaultName: 'Arena Cittadina',
      image: 'assets/images/stadi/stadio-livello-2.png',
      capacity: 25000,
      income: 120000,
      upgradeCost: 60,
      homeBonus: { win: 3, draw: 1, loss: 0 },
    },
    {
      level: 3,
      defaultName: 'Stadio Regionale',
      image: 'assets/images/stadi/stadio-livello-3.png',
      capacity: 40000,
      income: 300000,
      upgradeCost: 80,
      homeBonus: { win: 3, draw: 2, loss: 1 },
    },
    {
      level: 4,
      defaultName: 'Stadio Nazionale',
      image: 'assets/images/stadi/stadio-livello-4.png',
      capacity: 60000,
      income: 450000,
      upgradeCost: 100,
      homeBonus: { win: 4, draw: 3, loss: 1 },
    },
    {
      level: 5,
      defaultName: 'Super Arena',
      image: 'assets/images/stadi/stadio-livello-5.png',
      capacity: 80000,
      income: 650000,
      upgradeCost: 120,
      homeBonus: { win: 5, draw: 3, loss: 2 },
    },
    {
      level: 6,
      defaultName: 'Arena Infinita',
      image: 'assets/images/stadi/stadio-livello-6.png',
      capacity: 90000,
      income: 900000,
      upgradeCost: 150,
      homeBonus: { win: 6, draw: 4, loss: 2 },
    },
  ];

  get currentStadium(): StadiumLevel {
    return (
      this.stadiums.find((s) => s.level === this.currentLevel) ??
      this.stadiums[0]
    );
  }

  get canUpgradeByDate(): boolean {
    const today = new Date();
    const year = today.getFullYear();

    const start = new Date(year, 5, 1); // 1 giugno
    const end = new Date(year, 7, 1, 23, 59, 59); // 1 agosto

    return today >= start && today <= end;
  }

  isUnlocked(level: number): boolean {
    return level <= this.currentLevel;
  }

  saveStadiumName(): void {
    localStorage.setItem('stadiumName', this.stadiumName);
  }

  upgradeStadium(): void {
    if (this.currentLevel >= this.stadiums.length) {
      return;
    }

    this.currentLevel++;
    localStorage.setItem('stadiumLevel', String(this.currentLevel));
  }

  get nextStadium(): StadiumLevel | undefined {
    return this.stadiums.find((s) => s.level === this.currentLevel + 1);
  }
}
