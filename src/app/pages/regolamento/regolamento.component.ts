import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Regolamento,
  RegolamentoService,
} from '../../services/regolamento.service';

@Component({
  selector: 'app-regolamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regolamento.component.html',
  styleUrl: './regolamento.component.scss',
})
export class RegolamentoComponent implements OnInit {
  regolamento: Regolamento | null = null;
  loading = false;
  errorMessage = '';

  constructor(private regolamentoService: RegolamentoService) {}

  async ngOnInit(): Promise<void> {
    await this.loadRegolamento();
  }

  async loadRegolamento(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';
      this.regolamento = await this.regolamentoService.getActiveRegolamento();
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Errore durante il caricamento del regolamento.';
    } finally {
      this.loading = false;
    }
  }

  formatContent(content: string): string {
    if (!content) return '';

    return content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>');
  }
}
