import { Routes } from '@angular/router';
import { AlboDoroComponent } from './pages/albo-doro/albo-doro.component';
import { ClassificaComponent } from './pages/classifica/classifica.component';
import { HomeComponent } from './pages/home/home.component';
import { RoseComponent } from './pages/rose/rose.component';
import { StadioComponent } from './pages/stadio/stadio.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'albo-doro', component: AlboDoroComponent },
  { path: 'classifica', component: ClassificaComponent },
  { path: 'rose', component: RoseComponent },
  { path: 'stadio', component: StadioComponent },
  { path: '**', redirectTo: '' },
];
