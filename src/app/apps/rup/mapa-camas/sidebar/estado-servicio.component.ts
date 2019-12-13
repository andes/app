import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-estado-servicio',
    templateUrl: './estado-servicio.component.html',
})

export class EstadoServicioComponent implements OnInit {
    @Input() fecha: Date;
    @Input() camas: any;
    @Input() estados: any;
    @Output() buscarEstados = new EventEmitter<Date>();

    camasXEstado: any;
    constructor(
        public auth: Auth,
        private router: Router,
    ) { }

    ngOnInit() {
        this.camasXEstado = this.groupBy(this.camas, 'estado');
        console.log(this.camasXEstado);
    }

    groupBy(xs: any[], key: string) {
        return xs.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    getEstadosCamas() {
        this.buscarEstados.emit(this.fecha);
    }
}
