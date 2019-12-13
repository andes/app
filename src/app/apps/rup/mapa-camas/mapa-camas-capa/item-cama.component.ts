import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
})

export class ItemCamaComponent implements OnInit {
    @Input() capa: string;
    @Input() cama: any;
    @Input() estados: any;
    @Input() relaciones: any;

    @Output() accionCama = new EventEmitter<any>();

    estadoActual: any;
    destinos = [];

    constructor(
        public auth: Auth,
        private router: Router,
    ) { }

    ngOnInit() {
        this.estadoActual = this.estados.filter(est => this.cama.estado === est.key)[0];
        this.estados.map(est => this.relaciones.map(rel => {
            if (this.estadoActual.key === rel.origen) {
                if (est.key === rel.destino) {
                    this.destinos.push(est);
                }
            }
        }));
    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.capa}/${this.cama._id}`]);
    }

    accion(estadoDestino) {
        this.accionCama.emit({ cama: this.cama, estadoDestino });
    }
}
