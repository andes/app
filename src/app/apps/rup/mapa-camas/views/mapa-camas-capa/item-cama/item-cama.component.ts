import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { aporteOxigeno, respirador, monitorTelemetrico, monitorFisiologico } from '../../../constantes-internacion';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ItemCamaComponent implements OnChanges {
    @Input() cama: any;
    @Input() capa: any;
    @Input() permisoIngreso: boolean;
    @Input() permisoBloqueo: boolean;
    @Input() relacionesPosibles: any;
    @Input() estadoCama: any;
    @Output() accionCama = new EventEmitter<any>();

    canEdit = this.auth.check('internacion:cama:edit');
    canMovimientos = this.auth.check('internacion:movimientos');

    public equipos = {
        aporteOxigeno: false,
        respirador: false,
        monitorParamedico: false,
    };

    get sectorCama() {
        return this.cama.sectores[this.cama.sectores.length - 1].nombre;
    }

    constructor(
        public auth: Auth,
        private router: Router
    ) {
    }

    ngOnChanges() {
        this.equipos = {
            aporteOxigeno: false,
            respirador: false,
            monitorParamedico: false,
        };
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
