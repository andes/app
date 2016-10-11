import { PacienteComponent } from './components/paciente/paciente.component';
import { HttpModule } from '@angular/http';
import { OrganizacionService } from './services/organizacion.service';
import { EspecialidadService } from './services/especialidad.service';
import { OrganizacionCreateComponent } from './components/organizacion/organizacion-create.component';
import { OrganizacionComponent } from './components/organizacion/organizacion.component';
import { EspecialidadCreateComponent} from './components/especialidad/especialidad-create.component';
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateComponent } from './components/profesional/profesional-create.component';
import { ProfesionalService } from './services/profesional.service';

import { BarrioService } from './services/barrio.service';
import { LocalidadService } from './services/localidad.service';
import { PaisService } from './services/pais.service';
import { PacienteService } from './services/paciente.service';
import { PacienteCreateComponent } from './components/paciente/paciente-create.component';
import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { FinanciadorService } from './services/financiador.service';

import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }  from './app.component';

import {ReactiveFormsModule} from "@angular/forms";
import { routing } from './app.routing';

import {DataTableModule,SharedModule} from 'primeng/primeng';
import {ToggleButtonModule} from 'primeng/primeng';


@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, HttpModule, routing, DataTableModule,SharedModule, ToggleButtonModule],

  declarations: [AppComponent, OrganizacionComponent, OrganizacionCreateComponent, EspecialidadComponent, 
  EspecialidadCreateComponent, ProfesionalComponent, PacienteCreateComponent, PacienteComponent],
  bootstrap: [AppComponent],
  providers: [OrganizacionService, ProvinciaService, TipoEstablecimientoService, EspecialidadService, ProfesionalService, 
             PaisService, LocalidadService, BarrioService, PacienteService, FinanciadorService]

})
export class AppModule { }
