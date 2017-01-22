import { Component, Input } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from 'andes-plex/src/lib/core/service';

@Component({
    selector: 'vista-agenda',
    templateUrl: 'vista-agenda.html'
})

export class VistaAgendaComponent {

    constructor(public plex: Plex) { }

    showVistaAgendas: boolean = true;

    @Input() vistaAgenda: IAgenda;    
}