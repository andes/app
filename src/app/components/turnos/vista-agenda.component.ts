import { Component, Input } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from 'andes-plex/src/lib/core/service';
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'vista-agenda',
    templateUrl: 'vista-agenda.html'
})

export class VistaAgendaComponent {

    showVistaAgendas: boolean = true;

    @Input() vistaAgenda: IAgenda;

    public agendas: IAgenda[];

    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

    suspenderAgenda(agenda) {
        agenda.estado = 'Suspendida';

        this.serviceAgenda.save(agenda).subscribe(resultado => {
            this.plex.alert('La agenda paso a Estado: ' + agenda.estado);
        });
    }
}
