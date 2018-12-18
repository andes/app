import { Component, Input, Output, EventEmitter, OnInit, HostBinding } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';

import { TurnoService } from './../../../../services/turnos/turno.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'detalle-agenda',
    templateUrl: 'detalle-agenda.html',
    styleUrls: ['revision-agenda.scss']
})

export class DetalleAgendaComponent implements OnInit {

    private _agenda: any;
    // Parámetros
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }


    constructor(public plex: Plex,
        public router: Router,
        public auth: Auth,
        public serviceTurno: TurnoService,
        public serviceAgenda: AgendaService) {
    }

    ngOnInit() {

    }

}
