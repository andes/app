import { SharedModule } from '@andes/shared';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DirectiveLibModule } from 'src/app/directives/directives.module';

import { PacienteBuscarComponent } from './components/paciente-buscar.component';
import { PacienteListadoComponent } from './components/paciente-listado.component';
import { PacienteRelacionesComponent } from './components/paciente-relaciones.component';
import { PacienteBusquedaComponent } from './components/paciente-busqueda.component';
import { FotoDirective } from './components/paciente-detalle-foto.directive';

// Esta componente es parte de la parte SHARED de MPI, habría que moverla a este modulo.
import { UpdateContactoDireccionComponent } from '../../components/turnos/dashboard/update-contacto-direccion.component';

// Esta componente es parte de la parte SHARED de MPI, habría que moverla a este modulo.
import { PacienteDetalleComponent } from './components/paciente-detalle.component';

// Esta componente es parte de la parte SHARED de MPI, habría que moverla a este modulo.
import { CarpetaPacienteComponent } from '../../components/carpeta-paciente/carpeta-paciente.component';
import { PacientePanelComponent } from './components/paciente-panel.component';
import { BusquedaMpiComponent } from 'src/app/core/mpi/components/busqueda-mpi.component';
import { DatosBasicosComponent } from 'src/app/core/mpi/components/datos-basicos.component';
import { DatosContactoComponent } from 'src/app/core/mpi/components/datos-contacto.component';
import { DocumentosPacienteComponent } from 'src/app/core/mpi/components/documentos-paciente.component';
import { NotaComponent } from 'src/app/core/mpi/components/notas-paciente.component';
import { PacienteComponent } from 'src/app/core/mpi/components/paciente.component';
import { RelacionesPacientesComponent } from 'src/app/core/mpi/components/relaciones-pacientes.component';
import { ActivarAppComponent } from 'src/app/components/turnos/punto-inicio/activar-app.component';
import { GeorrefMapComponent } from 'src/app/core/mpi/components/georref-map.component';

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule
    ],
    declarations: [
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacienteRelacionesComponent,
        PacienteBusquedaComponent,
        PacientePanelComponent,
        UpdateContactoDireccionComponent,
        PacienteDetalleComponent,
        CarpetaPacienteComponent,
        FotoDirective,
        NotaComponent,
        RelacionesPacientesComponent,
        BusquedaMpiComponent,
        PacienteComponent,
        DatosBasicosComponent,
        DatosContactoComponent,
        DocumentosPacienteComponent,
        ActivarAppComponent,
        GeorrefMapComponent
    ],
    exports: [
        PacienteBuscarComponent,
        PacienteListadoComponent,
        PacienteRelacionesComponent,
        PacienteBusquedaComponent,
        PacientePanelComponent,
        UpdateContactoDireccionComponent,
        PacienteDetalleComponent,
        CarpetaPacienteComponent,
        FotoDirective,
        NotaComponent,
        RelacionesPacientesComponent,
        BusquedaMpiComponent,
        PacienteComponent,
        DatosBasicosComponent,
        DatosContactoComponent,
        DocumentosPacienteComponent,
        ActivarAppComponent,
        GeorrefMapComponent
    ]
})
export class MPILibModule {
}
