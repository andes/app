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

@NgModule({
    imports: [
        CommonModule,
        PlexModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule,
        DirectiveLibModule,
        MPILibModule
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
        InfoAgendaComponent],
    exports: [
        DarTurnosComponent,
        DarSobreturnoComponent,
        SortBloquesPipe,
        EspacioFisicoPipe,
        CalendarioComponent,
        BotonesAgendaPipe,
        BotonesAgendaGeneralPipe,
        BotonesTurnosPipe,
        InfoAgendaComponent],
})
export class CITASLibModule {

}
