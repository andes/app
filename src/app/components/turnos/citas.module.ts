import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlexModule } from '@andes/plex';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@andes/shared';
import { SortBloquesPipe } from '../../pipes/agenda-bloques.pipe';
import { EspacioFisicoPipe } from '../../pipes/espacioFisico.pipe';
import { DarTurnosComponent } from './dar-turnos/dar-turnos.component';
import { DarSobreturnoComponent } from './dar-turnos/dar-sobreturno.component';
import { CalendarioComponent } from './dar-turnos/calendario.component';
import { MPILibModule } from 'src/app/modules/mpi/mpi-lib.module';
import { DirectiveLibModule } from '../../directives/directives.module';
import { BotonesAgendaPipe } from './gestor-agendas/pipes/botonesAgenda.pipe';
import { BotonesAgendaGeneralPipe } from './gestor-agendas/pipes/botonesAgendaGeneral.pipe';
import { BotonesTurnosPipe } from './gestor-agendas/pipes/botonesTurnos.pipe';
import { InfoAgendaComponent } from './gestor-agendas/info-agenda.component';
import { SeleccionarFinanciadorComponent } from './dar-turnos/seleccionar-financiador.component';
import { PrestacionesHabilitadasComponent } from './gestor-agendas/prestaciones-habilitadas/prestaciones-habilitadas.component';
import { DemandaInsatisfechaComponent } from '../demandaInsatisfecha/demanda-insatisfecha.component';
import { LiberarTurnoComponent } from './gestor-agendas/operaciones-turnos/liberar-turno.component';
import { EstadisticasAgendasComponent } from './dashboard/estadisticas-agendas.component';
import { EstadisticasPacientesComponent } from './dashboard/estadisticas-pacientes.component';
import { GestorAgendasComponent } from './gestor-agendas/gestor-agendas.component';
import { ClonarAgendaComponent } from './gestor-agendas/operaciones-agenda/clonar-agenda';
import { DetalleAgendaComponent } from './gestor-agendas/operaciones-agenda/detalle-agenda.component';
import { ModalAgendaComponent } from './gestor-agendas/operaciones-agenda/modal-agenda.component';
import { AgregarNotaAgendaComponent } from './gestor-agendas/operaciones-agenda/nota-agenda.component';
import { PanelAgendaComponent } from './gestor-agendas/operaciones-agenda/panel-agenda.component';
import { PlanificarAgendaComponent } from './gestor-agendas/operaciones-agenda/planificar-agenda.component';
import { RevisionAgendaComponent } from './gestor-agendas/operaciones-agenda/revision-agenda.component';
import { AgregarSobreturnoComponent } from './gestor-agendas/operaciones-agenda/sobreturno.component';
import { AgregarNotaTurnoComponent } from './gestor-agendas/operaciones-turnos/agregar-nota-turno.component';
import { ReasignarTurnoAgendasComponent } from './gestor-agendas/operaciones-turnos/reasignar/reasignar-turno-agendas.component';
import { ReasignarTurnoAutomaticoComponent } from './gestor-agendas/operaciones-turnos/reasignar/reasignar-turno-automatico.component';
import { ReasignarTurnoComponent } from './gestor-agendas/operaciones-turnos/reasignar/reasignar-turno.component';
import { SuspenderTurnoComponent } from './gestor-agendas/operaciones-turnos/suspender-turno.component';
import { RevisionFueraAgendaComponent } from './gestor-agendas/revision/fuera-agenda.component';
import { TurnosComponent } from './gestor-agendas/turnos.component';
import { PuntoInicioTurnosComponent } from './punto-inicio/puntoInicio-turnos.component';
import { ListaSolicitudTurnoVentanillaComponent } from './punto-inicio/solicitud-turno-ventanilla/lista-solicitud-turno-ventanilla.component';
import { SolicitudTurnoVentanillaComponent } from './punto-inicio/solicitud-turno-ventanilla/solicitud-turno-ventanilla.component';
import { TurnosPacienteComponent } from './punto-inicio/turnos-paciente.component';
import { EditEspacioFisicoComponent } from './configuracion/espacio-fisico/edit-espacio-fisico.component';
import { EspacioFisicoComponent } from './configuracion/espacio-fisico/espacio-fisico.component';
import { PanelEspacioComponent } from './configuracion/espacio-fisico/panel-espacio.component';
import { FiltrosMapaEspacioFisicoComponent } from './configuracion/mapa-espacio-fisico/filtros-mapa-espacio-fisico.component';
import { demandaInsatisfechaComponent } from './dashboard/demandaInsatisfecha';
import { TOPLibModule } from '../top/top.module';

@NgModule({
    imports: [
        CommonModule,
        PlexModule.forRoot({ networkLoading: true }),
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule,
        MPILibModule,
        TOPLibModule
    ],
    declarations: [
        DarTurnosComponent,
        DarSobreturnoComponent,
        CalendarioComponent,
        SortBloquesPipe,
        EspacioFisicoPipe,
        BotonesAgendaPipe,
        BotonesAgendaGeneralPipe,
        BotonesTurnosPipe,
        InfoAgendaComponent,
        SeleccionarFinanciadorComponent,
        PrestacionesHabilitadasComponent,
        DemandaInsatisfechaComponent,
        LiberarTurnoComponent,
        PlanificarAgendaComponent,
        GestorAgendasComponent,
        TurnosComponent,
        ClonarAgendaComponent,
        ModalAgendaComponent,
        RevisionAgendaComponent,
        AgregarSobreturnoComponent,
        RevisionFueraAgendaComponent,
        SuspenderTurnoComponent,
        AgregarNotaTurnoComponent,
        AgregarNotaAgendaComponent,
        ReasignarTurnoComponent,
        ReasignarTurnoAutomaticoComponent,
        EstadisticasAgendasComponent,
        EstadisticasPacientesComponent,
        PanelAgendaComponent,
        PuntoInicioTurnosComponent,
        ReasignarTurnoAgendasComponent,
        TurnosPacienteComponent,
        SolicitudTurnoVentanillaComponent,
        ListaSolicitudTurnoVentanillaComponent,
        DetalleAgendaComponent,
        PanelEspacioComponent,
        EspacioFisicoComponent,
        EditEspacioFisicoComponent,
        FiltrosMapaEspacioFisicoComponent,
        demandaInsatisfechaComponent
    ],
    exports: [
        DarTurnosComponent,
        DarSobreturnoComponent,
        SortBloquesPipe,
        EspacioFisicoPipe,
        CalendarioComponent,
        BotonesAgendaPipe,
        BotonesAgendaGeneralPipe,
        BotonesTurnosPipe,
        InfoAgendaComponent,
        SeleccionarFinanciadorComponent,
        PrestacionesHabilitadasComponent,
        LiberarTurnoComponent,
        PlanificarAgendaComponent,
        GestorAgendasComponent,
        TurnosComponent,
        ClonarAgendaComponent,
        ModalAgendaComponent,
        RevisionAgendaComponent,
        AgregarSobreturnoComponent,
        RevisionFueraAgendaComponent,
        SuspenderTurnoComponent,
        AgregarNotaTurnoComponent,
        AgregarNotaAgendaComponent,
        ReasignarTurnoComponent,
        ReasignarTurnoAutomaticoComponent,
        EstadisticasAgendasComponent,
        EstadisticasPacientesComponent,
        PanelAgendaComponent,
        PuntoInicioTurnosComponent,
        ReasignarTurnoAgendasComponent,
        TurnosPacienteComponent,
        SolicitudTurnoVentanillaComponent,
        ListaSolicitudTurnoVentanillaComponent,
        DetalleAgendaComponent,
        PanelEspacioComponent,
        EspacioFisicoComponent,
        EditEspacioFisicoComponent,
        FiltrosMapaEspacioFisicoComponent,
        demandaInsatisfechaComponent
    ],
})
export class CITASLibModule {

}
