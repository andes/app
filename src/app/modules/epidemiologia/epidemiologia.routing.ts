import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuscadorFichaEpidemiologicaComponent } from './components/buscador-ficha-epidemiologica/buscador-ficha-epidemiologica.component';
import { FichaEpidemiologicaContactosComponent } from './components/ficha-epidemiologica-contactos/ficha-epidemiologica-contactos.component';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica.component';
import { SeguimientoEpidemiologiaComponent } from './components/seguimiento/seguimientoEpidemiologia.component';


const routes: Routes = [
  {
    path: 'ficha-epidemiologica',
    component: FichaEpidemiologicaComponent
  },
  {
    path: 'buscador-ficha-epidemiologica',
    component: BuscadorFichaEpidemiologicaComponent
  },
  {
    path: 'ficha-epidemiologica-contactos',
    component: FichaEpidemiologicaContactosComponent
  },
  {
    path: 'seguimiento',
    component: SeguimientoEpidemiologiaComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpidemiologiaRoutingModule { }
