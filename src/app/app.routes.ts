import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { AlboDoroComponent } from './pages/albo-doro/albo-doro.component';
import { ClassificaComponent } from './pages/classifica/classifica.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RoseComponent } from './pages/rose/rose.component';
import { StadioComponent } from './pages/stadio/stadio.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'albo-doro', component: AlboDoroComponent },
  { path: 'classifica', component: ClassificaComponent },
  { path: 'rose', component: RoseComponent },
  { path: 'stadio', component: StadioComponent },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'admin', component: AdminComponent },

  { path: '**', redirectTo: '' },
];
