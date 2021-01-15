import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { MPILibModule } from '../mpi/mpi-lib.module';

import { EpidemiologiaRoutingModule } from './epidemiologia.routing';
import { EpidemiologiaComponent } from './components/epidemiologia.component';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica/ficha-epidemiologica.component';


@NgModule({
  declarations: [EpidemiologiaComponent, FichaEpidemiologicaComponent],
  imports: [
    CommonModule,
    EpidemiologiaRoutingModule,
    PlexModule,
    MPILibModule
  ]
})
export class EpidemiologiaModule { }
