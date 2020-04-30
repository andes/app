import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { aporteOxigeno } from '../../../constantes-internacion';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
})

export class ItemCamaComponent implements OnInit {
    @Input() cama: any;
    @Input() capa: any;
    @Input() permisoIngreso: boolean;
    @Output() accionCama = new EventEmitter<any>();

    public tieneOxigeno: boolean;
    public relacionesPosibles$: Observable<any>;
    public estadoCama$: Observable<any>;
    public puedeDesocupar$: Observable<string>;

    get sectorCama() {
        return this.cama.sectores[this.cama.sectores.length - 1].nombre;
    }

    constructor(
        public auth: Auth,
        private router: Router,
        private mapaCamasService: MapaCamasService,
    ) {
    }

    ngOnInit() {
        this.estadoCama$ = this.mapaCamasService.getEstadoCama(this.cama);
        this.relacionesPosibles$ = this.mapaCamasService.getRelacionesPosibles(this.cama);

        this.tieneOxigeno = false;
        this.cama.equipamiento.map(equip => {
            if (equip.conceptId === aporteOxigeno.conceptId) {
                this.tieneOxigeno = true;
            }
        });
    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.cama._id}`]);
    }

    accion(relacion, $event) {
        $event.stopPropagation();
        this.accionCama.emit(relacion);
    }
}
