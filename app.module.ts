import { TipoEstablecimientoService } from './services/tipoEstablecimiento.service';
import { ProvinciaService } from './services/provincia.service';
import { HttpModule } from '@angular/http';
import { EstablecimientoService } from './services/establecimiento.service';
import { EstablecimientoCreateComponent } from './components/establecimiento/establecimiento-create.component';
import { EstablecimientoComponent } from './components/establecimiento/establecimiento.component';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';

import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [ BrowserModule, ReactiveFormsModule, HttpModule],
  declarations: [ AppComponent, EstablecimientoComponent, EstablecimientoCreateComponent ],
  bootstrap: [ AppComponent ],
  providers: [EstablecimientoService,ProvinciaService, TipoEstablecimientoService]
})
export class AppModule { }
