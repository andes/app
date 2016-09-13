import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { HttpModule } from '@angular/http';
import { EstablecimientoService } from './services/establecimiento.service';
import { EspecialidadService } from './services/especialidad.service';
import { EstablecimientoCreateComponent } from './components/establecimiento/establecimientoCreate.component';
import { EstablecimientoComponent } from './components/establecimiento/establecimiento.component';

import { EspecialidadComponent } from './components/especialidad/especialidad.component';
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateComponent } from './components/profesional/profesional-create.component';
import { ProfesionalService } from './services/profesional.service';

import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { routing }        from './app.routing';
import { AppComponent }  from './app.component';

import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [ BrowserModule, ReactiveFormsModule, HttpModule, routing],
  declarations: [ AppComponent, EstablecimientoComponent, EstablecimientoCreateComponent, EspecialidadComponent ,ProfesionalComponent,ProfesionalCreateComponent ],
  bootstrap: [ AppComponent ],
  providers: [EstablecimientoService,ProvinciaService, TipoEstablecimientoService, EspecialidadService]

})
export class AppModule { }
