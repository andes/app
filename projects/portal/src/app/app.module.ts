import { BrowserModule } from '@angular/platform-browser';
import { FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlexModule } from '@andes/plex';
import { Server, SharedModule } from '@andes/shared';
import { Auth } from '@andes/auth';

// Declarations
import { HomeComponent } from './home.component';
import { LoginComponent } from './login/login-portal-paciente';
import { LoginService } from './login/service/login-portal-paciente.service';
import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';
import { PortalPacienteMainComponent } from './portal-paciente/portal-paciente-main.component';
import { PacienteDetalleComponent } from './components/paciente-detalle.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    PortalPacienteComponent,
    PacienteDetalleComponent,
    PortalPacienteMainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlexModule.forRoot({ networkLoading: true }),
    FormsModule,
    HttpClientModule
  ],
  providers: [
    Server,
    LoginService,
    Auth,
    HttpClientModule,
    InfiniteScrollModule,
    SharedModule,
    FormsModule,
    FormGroupDirective,
    ReactiveFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
