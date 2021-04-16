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
import { BuscadorFichaEpidemiologicaComponent } from './components/buscador-ficha-epidemiologica/buscador-ficha-epidemiologica.component';
import { DirectiveLibModule } from '../../directives/directives.module';



@NgModule({
  declarations: [
    FichaEpidemiologicaComponent,
    FichaEpidemiologicaCrudComponent,
    SelectSearchDirective,
    BuscadorFichaEpidemiologicaComponent
  ],
  imports: [
    CommonModule,
    EpidemiologiaRoutingModule,
    PlexModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MPILibModule,
    SharedModule,
    DirectiveLibModule
  ],
  providers: [FormsService, SelectSearchService],
  exports: [FichaEpidemiologicaCrudComponent]
})
export class EpidemiologiaModule { }
