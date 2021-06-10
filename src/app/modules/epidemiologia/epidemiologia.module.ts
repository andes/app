import { PlexModule } from '@andes/plex';
import { SharedModule } from '@andes/shared';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectiveLibModule } from '../../directives/directives.module';
import { SelectSearchDirective } from '../../directives/select-search.directive';
import { SelectSearchService } from '../../services/select-search.service';
import { FormsService } from '../forms-builder/services/form.service';
import { MPILibModule } from '../mpi/mpi-lib.module';
import { ElementosRUPModule } from '../rup/elementos-rup.module';
import { BuscadorFichaEpidemiologicaComponent } from './components/buscador-ficha-epidemiologica/buscador-ficha-epidemiologica.component';
import { FichaEpidemiologicaContactosComponent } from './components/ficha-epidemiologica-contactos/ficha-epidemiologica-contactos.component';
import { FichaEpidemiologicaCrudComponent } from './components/ficha-epidemiologica-crud/ficha-epidemiologica-crud.component';
import { FichaEpidemiologicaComponent } from './components/ficha-epidemiologica/ficha-epidemiologica.component';
import { HistorialFichaComponent } from './components/historial-ficha/historial-ficha.component';
import { DetalleSeguimientoComponent } from './components/seguimiento/detalle-seguimiento/detalle-seguimiento.component';
import { SeguimientoEpidemiologiaComponent } from './components/seguimiento/seguimientoEpidemiologia.component';
import { EpidemiologiaRoutingModule } from './epidemiologia.routing';
import { CodigSisaPipe } from './pipes/codigoSisa.pipe';
import { SeguimientoFieldsPipe } from './pipes/seguimientoFields.pipe';



@NgModule({
  declarations: [
    FichaEpidemiologicaComponent,
    FichaEpidemiologicaCrudComponent,
    FichaEpidemiologicaContactosComponent,
    SelectSearchDirective,
    BuscadorFichaEpidemiologicaComponent,
    HistorialFichaComponent,
    SeguimientoEpidemiologiaComponent,
    DetalleSeguimientoComponent,
    CodigSisaPipe,
    SeguimientoFieldsPipe
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
    DirectiveLibModule,
    ElementosRUPModule
  ],
  providers: [FormsService, SelectSearchService],
  exports: [FichaEpidemiologicaCrudComponent]
})
export class EpidemiologiaModule { }
