
import { Component, OnInit, Input } from '@angular/core';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';

@Component({
    selector: 'rup-fuera-de-agenda',
    templateUrl: 'rup-fuera-de-agenda.html',
    styleUrls: [
        './turnos-rup.scss'
    ]
})
export class RUPFueraDeAgendaComponent implements OnInit {

    @Input() fueraDeAgenda;
    @Input() prestacion;

    prestaciones = [];
    listaFueraAgenda: any;

    constructor(public servicioPrestacion: PrestacionesService) {

    }

    ngOnInit() {

    }

}
