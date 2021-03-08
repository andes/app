import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlexModule } from '@andes/plex';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login-portal-paciente';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login/service/login-portal-paciente.service';
import { Server } from '@andes/shared';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlexModule.forRoot({ networkLoading: true }),
    FormsModule,
    HttpClientModule
  ],
  providers: [LoginService,
    Server, HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
