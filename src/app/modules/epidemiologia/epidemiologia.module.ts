import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { EpidemiologiaRoutingModule } from './epidemiologia.routing';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica.component';
import { FormsService } from '../forms-builder/services/form.service';
import { FichaEpidemiologicaCrudComponent } from './components/ficha-epidemiologica-crud/ficha-epidemiologica-crud.component';
import { SelectSearchDirective } from '../../directives/select-search.directive';
import { SelectSearchService } from '../../services/select-search.service';
import { SharedModule } from '@andes/shared';



@NgModule({
  declarations: [FichaEpidemiologicaComponent, FichaEpidemiologicaCrudComponent, SelectSearchDirective],
  imports: [
    CommonModule,
    EpidemiologiaRoutingModule,
    PlexModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MPILibModule,
    SharedModule
  ],
  providers: [FormsService, SelectSearchService]
})
export class EpidemiologiaModule { }
