import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { AlboDoroComponent } from './pages/albo-doro/albo-doro.component';
import { ClassificaComponent } from './pages/classifica/classifica.component';
import { LoginComponent } from './pages/login/login.component';
import { RegolamentoComponent } from './pages/regolamento/regolamento.component';
import { RoseComponent } from './pages/rose/rose.component';
import { StadioComponent } from './pages/stadio/stadio.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },

  { path: 'regolamento', component: RegolamentoComponent },
  { path: 'classifica', component: ClassificaComponent },
  { path: 'rose', component: RoseComponent },
  { path: 'stadio', component: StadioComponent },
  { path: 'albo-doro', component: AlboDoroComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },

  { path: '**', redirectTo: 'dashboard' },
];
