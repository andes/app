import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { aporteOxigeno, respirador, monitorTelemetrico, monitorFisiologico } from '../../../constantes-internacion';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { map } from 'rxjs/operators';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ItemCamaComponent implements OnChanges {
    @Input() cama: any;
    @Input() permisoIngreso: boolean;
    @Input() permisoBloqueo: boolean;
    @Input() relacionesPosibles: any;
    @Input() estadoCama: any;
    @Output() accionCama = new EventEmitter<any>();

    canEdit = false;

    columns$ = this.mapaCamasService.columnsMapa.pipe(
        map((columns) => {
            return columns;
        })
    );

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
        private router: Router,
        private mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
    ) {
    }

    ngOnChanges() {
        this.canEdit = this.cama.sala ? this.permisosMapaCamasService.salaEdit : this.permisosMapaCamasService.camaEdit;

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
        if (this.cama.sala) {
            this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/sala-comun/${this.cama.id}`]);
        } else {
            this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/cama/${this.cama.id}`]);
        }
    }

    accion(relacion, $event) {
        $event.stopPropagation();
        this.accionCama.emit(relacion);
    }
}
