
import { Component, OnInit, Input } from '@angular/core';
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
    @Input() esFutura;

    constructor(public auth: Auth, public servicioPrestacion: PrestacionesService) {

    }

    ngOnInit() {
    }

}