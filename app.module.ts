import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { HttpModule } from '@angular/http';
import { EstablecimientoService } from './services/establecimiento.service';
import { EspecialidadService } from './services/especialidad.service';
import { EstablecimientoCreateComponent } from './components/establecimiento/establecimientoCreate.component';
import { EstablecimientoComponent } from './components/establecimiento/establecimiento.component';
<<<<<<< HEAD
import { EspecialidadComponent } from './components/especialidad/especialidad.component';
=======
import { ProfesionalComponent } from './components/profesional/profesional.component';
import { ProfesionalCreateComponent } from './components/profesional/profesional-create.component';
import { ProfesionalService } from './services/profesional.service';

>>>>>>> c6ef962fd9144d0237cbb71b5bda76baafb0e28d
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';

import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [ BrowserModule, ReactiveFormsModule, HttpModule],
<<<<<<< HEAD
  declarations: [ AppComponent, EstablecimientoComponent, EstablecimientoCreateComponent, EspecialidadComponent ],
  bootstrap: [ AppComponent ],
  providers: [EstablecimientoService,ProvinciaService, TipoEstablecimientoService, EspecialidadService]
=======
  declarations: [ AppComponent, EstablecimientoComponent, EstablecimientoCreateComponent,ProfesionalComponent,ProfesionalCreateComponent ],
  bootstrap: [ AppComponent ],
  providers: [EstablecimientoService,ProvinciaService, TipoEstablecimientoService, ProfesionalService]
>>>>>>> c6ef962fd9144d0237cbb71b5bda76baafb0e28d
})
export class AppModule { }
