import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-albo-doro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './albo-doro.component.html',
  styleUrl: './albo-doro.component.scss',
})
export class AlboDoroComponent implements OnInit {
  loading = false;
  errorMessage = '';
  items: HallOfFameItem[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadHallOfFame();
  }

  async loadHallOfFame(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    const { data, error } = await supabase
      .from('hall_of_fame')
      .select('id, title, season, left_content, right_content, sort_order')
      .order('season', { ascending: false })
      .order('sort_order', { ascending: true });

    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    this.items = data ?? [];
  }

  formatText(value: string): string {
    if (!value) return '';

    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
