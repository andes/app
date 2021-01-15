import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica/ficha-epidemiologica.component';


const routes: Routes = [
  {
    path: 'ficha-epidemiologica',
    component: FichaEpidemiologicaComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpidemiologiaRoutingModule { }
