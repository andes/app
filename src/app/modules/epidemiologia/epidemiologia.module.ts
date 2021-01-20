import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { MPILibModule } from '../mpi/mpi-lib.module';

import { EpidemiologiaRoutingModule } from './epidemiologia.routing';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica.component';
import { FormsService } from '../forms-builder/services/form.service';


@NgModule({
  declarations: [FichaEpidemiologicaComponent],
  imports: [
    CommonModule,
    EpidemiologiaRoutingModule,
    PlexModule,
    MPILibModule
  ],
  providers: [FormsService]
})
export class EpidemiologiaModule { }
