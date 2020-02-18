import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
})

export class ItemCamaComponent implements OnInit {
    @Input() cama: any;

    @Output() accionCama = new EventEmitter<any>();

    public capa: string;
    public estadoCama;
    public relacionesPosibles;

    public relacionesPosibles$: Observable<any>;
    public estadoCama$: Observable<any>;

    get sectorCama() {
        return this.cama.sectores[this.cama.sectores.length - 1].nombre;
    }

    constructor(
        public auth: Auth,
        private router: Router,
        private mapaCamasService: MapaCamasService
    ) {
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;

        this.estadoCama$ = this.mapaCamasService.estado$.pipe(
            map(estados => {
                return estados.filter(est => this.cama.estado === est.key)[0];
            })
        );

        this.relacionesPosibles$ = combineLatest(this.mapaCamasService.estado$, this.mapaCamasService.relaciones$).pipe(
            map(([estados, relaciones]) => {
                return this.getEstadosRelacionesCama(estados, relaciones);
            })
        );
    }

    getEstadosRelacionesCama(estados, relaciones) {
        const relacionesPosibles = [];
        this.estadoCama = estados.filter(est => this.cama.estado === est.key)[0];

        estados.map(est => relaciones.map(rel => {
            if (this.estadoCama.key === rel.origen) {
                if (est.key === rel.destino && rel.destino !== 'inactiva') {
                    relacionesPosibles.push(rel);
                }
            }
        }));
        return relacionesPosibles;
    }

    goTo() {
        // [TODO] Editar capas
        this.router.navigate([`/internacion/cama/${this.capa}/${this.cama._id}`]);
    }

    accion(relacion) {
        this.accionCama.emit(relacion);
    }
}
