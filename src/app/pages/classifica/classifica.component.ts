import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ClassificaService,
  StandingRow,
} from '../../services/classifica.service';

@Component({
  selector: 'app-classifica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classifica.component.html',
  styleUrl: './classifica.component.scss',
})
export class ClassificaComponent implements OnInit {
  standings: StandingRow[] = [];
  loading = true;
  error = '';

  constructor(private classificaService: ClassificaService) {}

  ngOnInit(): void {
    this.classificaService.getClassifica().subscribe({
      next: (data) => {
        this.standings = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento della classifica.';
        this.loading = false;
      },
    });
  }
}
