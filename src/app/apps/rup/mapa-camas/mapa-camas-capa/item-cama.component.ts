import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
    @Input() selected: boolean;
    @Output() accionCama = new EventEmitter<any>();

    public estadoCama;
    public relacionesPosibles;

    constructor(
        public auth: Auth,
        private router: Router,
    ) { }

    ngOnInit() {
        this.getEstadosRelacionesCama();
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnChanges(changes: SimpleChanges) {
        if (changes && this.estadoCama) {
            if (this.cama.estado !== this.estadoCama.key) {
                this.getEstadosRelacionesCama();
            }
        }

    }

    getEstadosRelacionesCama() {
        this.relacionesPosibles = [];
        this.estadoCama = this.estados.filter(est => this.cama.estado === est.key)[0];
        this.estados.map(est => this.relaciones.map(rel => {
            if (this.estadoCama.key === rel.origen) {
                if (est.key === rel.destino && rel.destino !== 'inactiva') {
                    this.relacionesPosibles.push(rel);
                }
            }
        }));
    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.capa}/${this.cama._id}`]);
    }

    accion(relacion) {
        this.accionCama.emit({ cama: this.cama, relacion });
    }
}
