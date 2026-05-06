import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type StandingRow = {
  id: number;
  pos: number;
  teamName: string;
  g: number;
  p: number;
  v: number;
  n: number;
  pr: number;
  gf: number;
  gs: number;
  d_r: number;
  s_p: number;
};

@Injectable({
  providedIn: 'root',
})
export class ClassificaService {
  private apiUrl = 'http://localhost:3000/api/classifica';

  constructor(private http: HttpClient) {}

  getClassifica(): Observable<StandingRow[]> {
    return this.http.get<StandingRow[]>(this.apiUrl);
  }
}
