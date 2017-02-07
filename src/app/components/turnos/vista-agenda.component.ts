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
        let patch: any = {};

        patch = {
            'op': 'suspenderAgenda', 'path': 'estado', 'value': 'Suspendida'
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            agenda.estado = resultado.estado;

            this.plex.alert('La agenda paso a Estado: ' + resultado.estado);
        });
    }
}
