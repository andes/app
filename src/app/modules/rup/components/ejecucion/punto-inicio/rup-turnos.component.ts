
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../services/prestaciones.service';

@Component({
    selector: 'rup-turnos',
    templateUrl: 'rup-turnos.html',
    styleUrls: [
        '../../core/_rup.scss'
    ]
})
export class RUPTurnosComponent implements OnInit {

    @Input() agendaSeleccionada;
    @Input() tipo: 'turnos' | 'sobreturnos';
    @Input() esFutura;

    @Output() asistencia: EventEmitter<any> = new EventEmitter();
    turnos: any;

    constructor(public auth: Auth, public servicioPrestacion: PrestacionesService) {

    }

    ngOnInit() {
    }

    get actualizarTurnos() {
        return this.tipo === 'turnos' ? this.agendaSeleccionada.bloques : [{ turnos: this.agendaSeleccionada.sobreturnos }];
    }

    registrarInasistenciaEmit(event) {
        this.asistencia.emit(event);
    }

}