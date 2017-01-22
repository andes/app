import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { IBloque } from './../../interfaces/turnos/IBloque';
import { Plex } from 'andes-plex/src/lib/core/service';

@Component({
    selector: 'vista-agenda',
    templateUrl: 'vista-agenda.html'
})

export class VistaAgendaComponent implements OnInit {

    constructor(public plex: Plex) { }

    showVistaAgendas: boolean = true;

    @Input() vistaAgenda: IAgenda;

    ngOnInit() {
        this.vistaAgenda;
        debugger;
    }
}