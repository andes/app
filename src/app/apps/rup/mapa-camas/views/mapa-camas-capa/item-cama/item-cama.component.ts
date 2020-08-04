import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { aporteOxigeno, respirador, monitorTelemetrico, monitorFisiologico } from '../../../constantes-internacion';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
})

export class ItemCamaComponent implements OnInit {
    @Input() cama: any;
    @Input() capa: any;
    @Input() permisoIngreso: boolean;
    @Output() accionCama = new EventEmitter<any>();

    canEdit = this.auth.check('internacion:cama:edit');
    canMovimientos = this.auth.check('internacion:movimientos');

    public equipos = {
        aporteOxigeno: false,
        respirador: false,
        monitorParamedico: false,
    };
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

        if (this.cama.equipamiento) {
            this.cama.equipamiento.map(equip => {
                if (equip.conceptId === aporteOxigeno.conceptId) {
                    this.equipos.aporteOxigeno = true;
                }

                if (equip.conceptId === respirador.conceptId) {
                    this.equipos.respirador = true;
                }

                if ((equip.conceptId === monitorTelemetrico.conceptId) || (equip.conceptId === monitorFisiologico.conceptId)) {
                    this.equipos.monitorParamedico = true;
                }
            });
        }
    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.cama._id}`]);
    }

    accion(relacion, $event) {
        $event.stopPropagation();
        this.accionCama.emit(relacion);
    }
}
