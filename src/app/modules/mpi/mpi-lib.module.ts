import { SharedModule } from '@andes/shared';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { PacienteBuscarComponent } from './components/paciente-buscar.component';
import { PacienteListadoComponent } from './components/paciente-listado.component';
import { FotoDirective } from './components/paciente-detalle-foto.directive';

// Esta componente es parte de la parte SHARED de MPI, habría que moverla a este modulo.
import { BotonesRegistroComponent } from '../../core/mpi/components/mpi-botones-registro.component';

// Esta componente es parte de la parte SHARED de MPI, habría que moverla a este modulo.
import { UpdateContactoDireccionComponent } from '../../components/turnos/dashboard/update-contacto-direccion.component';

// Esta componente es parte de la parte SHARED de MPI, habría que moverla a este modulo.
import { PacienteDetalleComponent } from './components/paciente-detalle.component';

// Esta componente es parte de la parte SHARED de MPI, habría que moverla a este modulo.
import { CarpetaPacienteComponent } from '../../components/carpeta-paciente/carpeta-paciente.component';
import { PacientePanelComponent } from './components/paciente-panel.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        SharedModule
    ],
    declarations: [
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacientePanelComponent,
        BotonesRegistroComponent,
        UpdateContactoDireccionComponent,
        PacienteDetalleComponent,
        CarpetaPacienteComponent,
        FotoDirective
    ],
    entryComponents: [
    ],
    exports: [
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacientePanelComponent,
        BotonesRegistroComponent,
        UpdateContactoDireccionComponent,
        PacienteDetalleComponent,
        CarpetaPacienteComponent,
        FotoDirective
    ],
})
export class MPILibModule {
}
