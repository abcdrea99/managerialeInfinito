import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { supabase } from '../../core/supabase.client';

type StadiumLevel = {
  level: number;
  defaultName: string;
  image: string;
  capacity: number;
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './stadio.component.html',
  styleUrl: './stadio.component.scss',
})
export class StadioComponent implements OnInit {
  isLoggedIn = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  userId = '';
  profile: any = null;
  stadiumDbId: string | null = null;

  currentLevel = 1;
  stadiumName = 'Il mio stadio';
  userCredits = 0;

  stadiums: StadiumLevel[] = [
    {
      level: 1,
      defaultName: 'Stadio livello 1',
      image: 'assets/images/stadi/stadio-livello-1.png',
      capacity: 10000,
      upgradeCost: null,
      homeBonus: { win: 2, draw: 1, loss: 0 },
    },
    {
      level: 2,
      defaultName: 'Stadio livello 2',
      image: 'assets/images/stadi/stadio-livello-2.png',
      capacity: 25000,
      upgradeCost: 60,
      homeBonus: { win: 3, draw: 1, loss: 0 },
    },
    {
      level: 3,
      defaultName: 'Stadio livello 3',
      image: 'assets/images/stadi/stadio-livello-3.png',
      capacity: 40000,
      upgradeCost: 80,
      homeBonus: { win: 3, draw: 2, loss: 1 },
    },
    {
      level: 4,
      defaultName: 'Stadio livello 4',
      image: 'assets/images/stadi/stadio-livello-4.png',
      capacity: 60000,
      upgradeCost: 100,
      homeBonus: { win: 4, draw: 3, loss: 1 },
    },
    {
      level: 5,
      defaultName: 'Stadio livello 5',
      image: 'assets/images/stadi/stadio-livello-5.png',
      capacity: 80000,
      upgradeCost: 120,
      homeBonus: { win: 5, draw: 3, loss: 2 },
    },
    {
      level: 6,
      defaultName: 'Stadio livello 6',
      image: 'assets/images/stadi/stadio-livello-6.png',
      capacity: 90000,
      upgradeCost: 150,
      homeBonus: { win: 6, draw: 4, loss: 2 },
    },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
  }

  async loadUserData(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      this.isLoggedIn = false;
      this.loading = false;
      return;
    }

    this.isLoggedIn = true;
    this.userId = userData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, credits, role, team_id')
      .eq('id', this.userId)
      .single();

    if (profileError) {
      this.errorMessage = profileError.message;
      this.loading = false;
      return;
    }

    this.profile = profile;
    this.userCredits = profile.credits ?? 0;

    const { data: stadium, error: stadiumError } = await supabase
      .from('stadiums')
      .select('id, name, level')
      .eq('user_id', this.userId)
      .maybeSingle();

    if (stadiumError) {
      this.errorMessage = stadiumError.message;
      this.loading = false;
      return;
    }

    if (!stadium) {
      await this.createDefaultStadium();
    } else {
      this.stadiumDbId = stadium.id;
      this.stadiumName = stadium.name || 'Il mio stadio';
      this.currentLevel = stadium.level || 1;
    }

    this.loading = false;
  }

  async createDefaultStadium(): Promise<void> {
    const { data, error } = await supabase
      .from('stadiums')
      .insert({
        user_id: this.userId,
        name: 'Il mio stadio',
        level: 1,
      })
      .select('id, name, level')
      .single();

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.stadiumDbId = data.id;
    this.stadiumName = data.name;
    this.currentLevel = data.level;
  }

  get currentStadium(): StadiumLevel {
    return (
      this.stadiums.find((s) => s.level === this.currentLevel) ??
      this.stadiums[0]
    );
  }

  get nextStadium(): StadiumLevel | undefined {
    return this.stadiums.find((s) => s.level === this.currentLevel + 1);
  }

  get canUpgradeByDate(): boolean {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();

    const winterBlock =
      (month === 11 && day >= 31) || month === 0 || month === 1;

    const summerBlock =
      (month === 6 && day >= 31) || month === 7 || month === 8;

    return !winterBlock && !summerBlock;
  }

  isUnlocked(level: number): boolean {
    return level <= this.currentLevel;
  }

  async saveStadiumName(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.stadiumDbId) {
      this.errorMessage = 'Stadio non trovato.';
      return;
    }

    const { error } = await supabase
      .from('stadiums')
      .update({
        name: this.stadiumName.trim() || 'Il mio stadio',
        updated_at: new Date().toISOString(),
      })
      .eq('id', this.stadiumDbId);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.successMessage = 'Nome stadio salvato.';
    await this.loadUserData();
  }

  canUpgrade(): boolean {
    return (
      !!this.stadiumDbId &&
      !!this.nextStadium &&
      this.canUpgradeByDate &&
      this.userCredits >= (this.nextStadium.upgradeCost ?? 0)
    );
  }

  async upgradeStadium(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.stadiumDbId) {
      this.errorMessage = 'Stadio non trovato.';
      return;
    }

    if (!this.nextStadium) {
      this.errorMessage = 'Hai già raggiunto il livello massimo dello stadio.';
      return;
    }

    if (!this.canUpgradeByDate) {
      this.errorMessage =
        'In questo periodo non è possibile eseguire upgrade dello stadio.';
      return;
    }

    const nextLevel = this.nextStadium.level;
    const upgradeCost = this.nextStadium.upgradeCost ?? 0;

    if (this.userCredits < upgradeCost) {
      this.errorMessage = 'Crediti insufficienti per eseguire l’upgrade.';
      return;
    }

    const conferma = window.confirm(
      `Sei sicuro di eseguire l'upgrade dello stadio al livello ${nextLevel}? Ti verranno scalati ${upgradeCost} crediti.`,
    );

    if (!conferma) {
      return;
    }

    const newCredits = this.userCredits - upgradeCost;

    const { error: creditsError } = await supabase
      .from('profiles')
      .update({
        credits: newCredits,
      })
      .eq('id', this.userId);

    if (creditsError) {
      this.errorMessage = creditsError.message;
      return;
    }

    const { error: stadiumError } = await supabase
      .from('stadiums')
      .update({
        level: nextLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', this.stadiumDbId);

    if (stadiumError) {
      this.errorMessage = stadiumError.message;
      return;
    }

    this.userCredits = newCredits;
    this.currentLevel = nextLevel;

    this.successMessage = `Upgrade completato! Lo stadio è ora al livello ${nextLevel}.`;

    await this.loadUserData();
  }
}
