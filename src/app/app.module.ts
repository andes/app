import { AgendaComponent } from './components/turnos/agenda.component';
import { EspacioFisicoService } from './services/turnos/espacio-fisico.service';
import { PrestacionService } from './services/turnos/prestacion.service';
import { AgendaService } from './services/turnos/agenda.service';
import { EspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/espacio-fisico.component';
import { EditEspacioFisicoComponent } from './components/turnos/configuracion/espacio-fisico/edit-espacio-fisico.component';

import { BuscarAgendasComponent } from './components/turnos/buscar-agendas.component'

import { PrestacionComponent } from './components/turnos/configuracion/prestacion/prestacion.component';
import { PrestacionCreateComponent } from './components/turnos/configuracion/prestacion/prestacion-create.component';
import { PrestacionUpdateComponent } from './components/turnos/configuracion/prestacion/prestacion-update.component';

import { ConfigPrestacionComponent } from './components/turnos/configPrestacion.component';
import { ConfigPrestacionService } from './services/turnos/configPrestacion.service';
import { HttpModule } from '@angular/http';
import { InicioComponent } from './components/inicio/inicio.component';

import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateComponent } from './components/profesional/profesional-create.component';
import { ProfesionalUpdateComponent } from './components/profesional/profesional-update.component';

import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { EspecialidadCreateComponent} from './components/especialidad/especialidad-create.component';
import { EspecialidadUpdateComponent } from './components/especialidad/especialidad-update.component';

import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { OrganizacionCreateUpdateComponent } from './components/organizacion/organizacion-create-update.component';

import { PacienteComponent } from './components/paciente/paciente.component';
import { PacienteCreateComponent } from './components/paciente/paciente-create.component';
import { PacienteUpdateComponent } from './components/paciente/paciente-update.component';

import { OrganizacionService } from './services/organizacion.service';
import { ProfesionalService } from './services/profesional.service';
import { EspecialidadService } from './services/especialidad.service';
import { BarrioService } from './services/barrio.service';
import { LocalidadService } from './services/localidad.service';
import { PaisService } from './services/pais.service';
import { PacienteService } from './services/paciente.service';
import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { FinanciadorService } from './services/financiador.service';

import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }  from './app.component';

import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { routing, appRoutingProviders} from './app.routing';

import {DataTableModule,SharedModule} from 'primeng/primeng';
import {ToggleButtonModule} from 'primeng/primeng';

import { PlexModule } from 'andes-plex/src/lib/module';
import { Plex } from 'andes-plex/src/lib/core/service';
import { ServerService } from 'andes-shared/src/lib/server.service';

@NgModule({
  imports: [
    BrowserModule, 
    ReactiveFormsModule, 
    FormsModule,
    HttpModule, 
    DataTableModule,
    SharedModule, 
    ToggleButtonModule, 
    PlexModule,
    routing
  ],

  declarations: [
              AppComponent, InicioComponent, 
              OrganizacionComponent, OrganizacionCreateUpdateComponent, 
              ProfesionalUpdateComponent, ProfesionalComponent, ProfesionalCreateComponent,
              EspecialidadComponent, EspecialidadCreateComponent,EspecialidadUpdateComponent, 
              PacienteCreateComponent, PacienteComponent, PacienteUpdateComponent,
              ConfigPrestacionComponent, AgendaComponent, EspacioFisicoComponent, EditEspacioFisicoComponent, 
              PrestacionComponent, PrestacionCreateComponent, PrestacionUpdateComponent,
              BuscarAgendasComponent
  ],
  bootstrap: [AppComponent],
  providers: [
              OrganizacionService, 
              ProvinciaService, 
              TipoEstablecimientoService, 
              EspecialidadService, 
              ProfesionalService, 
              PaisService, 
              LocalidadService, 
              BarrioService, 
              PacienteService, 
              FinanciadorService,  
              Plex,
              PrestacionService,
              appRoutingProviders,
              ConfigPrestacionService,
              AgendaComponent,
              EspacioFisicoComponent,
              AgendaService,
              EspacioFisicoService,
              ServerService
  ]

})
export class AppModule { }
