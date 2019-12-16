
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
        // this.prestaciones = this.fueraDeAgenda.mapReduce(x => x.tipoPrestaciones);
        // console.log(this.fueraDeAgenda.map(x => x.solicitud.tipoPrestacion));
        // console.log(this.fueraDeAgenda.reduce((accumulator, prestacion) => accumulator + prestacion.solicitud.tipoPrestacion));
        // console.log(this.fueraDeAgenda.filter(p => p.solicitud.tipoPrestacion).length);

        // this.listaFueraAgenda = this.fueraDeAgenda.reduce((obj, prestacion) => {
        //     obj[prestacion.solicitud.tipoPrestacion.conceptId] = (obj[prestacion.solicitud.tipoPrestacion.conceptId] || 0) + 1;
        //     return obj;
        // }, {})

    }

}