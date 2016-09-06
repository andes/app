import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent }  from './app.component';
import {Establecimiento} from './establecimiento/establecimiento.component';

@NgModule({
  imports: [ BrowserModule, ReactiveFormsModule ],
  declarations: [ AppComponent, Establecimiento ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
