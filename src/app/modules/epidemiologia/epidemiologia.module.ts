import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { EpidemiologiaRoutingModule } from './epidemiologia.routing';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica.component';
import { FormsService } from '../forms-builder/services/form.service';
import { FichaCovidComponent } from './components/ficha-covid/ficha-covid.component';
import { SeccionComponent } from './components/seccion/seccion.component';
import { SelectSearchDirective } from '../../directives/select-search.directive';
import { SelectSearchService } from '../../services/select-search.service';



@NgModule({
  declarations: [FichaEpidemiologicaComponent, FichaCovidComponent, SeccionComponent, SelectSearchDirective],
  imports: [
    CommonModule,
    EpidemiologiaRoutingModule,
    PlexModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MPILibModule
  ],
  providers: [FormsService, SelectSearchService]
})
export class EpidemiologiaModule { }
