
// Module
import { PlexModule } from '@andes/plex';
import { AuthModule } from '@andes/auth';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@andes/shared';

import { PacienteBuscarComponent } from './pacientes/components/paciente-buscar.component';
import { NotaComponent } from './pacientes/components/notas-paciente.component';
import { PacienteBuscadorComponent } from './pacientes/views/paciente-buscador.component';
import { PacientePanelComponent } from './pacientes/components/paciente-panel.component';
import { PacienteListadoComponent } from './pacientes/components/paciente-listado.component';
import { PacienteCruComponent } from './pacientes/views/paciente-cru.component';
import { RelacionesPacientesComponent } from './pacientes/components/relaciones-pacientes.component';
import { PacientePipe } from '../../pipes/paciente.pipe';
import { PacienteBuscarService } from './pacientes/components/paciente-buscar.service';
import { ValidacionService } from './pacientes/services/validacion.services';
import { PacienteHttpService } from './pacientes/services/pacienteHttp.service';
import { HistorialBusquedaService } from './pacientes/services/historialBusqueda.service';
import { PacienteCacheService } from './pacientes/services/pacienteCache.service';
import { RelacionesHttpService } from './pacientes/services/relacionesHttp.service';
import { SharedAppModule } from '../../../app/shared/shared.module';
import { MPIRouting } from './mpi.routing';


@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        AuthModule,
        FormsModule,
        HttpClientModule,
        HttpModule,
        SharedAppModule,
        SharedModule,
        MPIRouting
    ],
    declarations: [
        PacienteCruComponent,
        PacienteBuscarComponent,
        PacienteBuscadorComponent,
        NotaComponent,
        PacientePanelComponent,
        PacienteListadoComponent,
        PacientePipe,
        RelacionesPacientesComponent
    ],
    exports: [
        PacientePipe,
        NotaComponent,
        PacienteBuscarComponent,
        RelacionesPacientesComponent,
        PacienteListadoComponent,
        PacientePanelComponent
    ]
})
export class MPIModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: MPIModule,
            providers: [PacienteHttpService, PacienteBuscarService, HistorialBusquedaService, ValidacionService, PacienteCacheService, RelacionesHttpService]
        };
    }
}



