import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'listar-turnos',
    templateUrl: 'listar-turnos.html'
})

export class ListarTurnosComponent implements OnInit {

    private _agenda;
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }

    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

    ngOnInit() {

    }

}
