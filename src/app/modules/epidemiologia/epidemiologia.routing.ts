import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica.component';
import { BuscadorFichaEpidemiologicaComponent } from './components/buscador-ficha-epidemiologica/buscador-ficha-epidemiologica.component';


const routes: Routes = [
  {
    path: 'ficha-epidemiologica',
    component: FichaEpidemiologicaComponent
  },
  {
    path: 'buscador-ficha-epidemiologica',
    component: BuscadorFichaEpidemiologicaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpidemiologiaRoutingModule { }
