import { Auth } from '@andes/auth';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { aporteOxigeno, monitorFisiologico, monitorTelemetrico, respirador } from '../../../constantes-internacion';
import { MapaCamasService } from '../../../services/mapa-camas.service';
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
    public capa = this.mapaCamasService.capa;

    public equipos = {
        aporteOxigeno: false,
        respirador: false,
        monitorParamedico: false,
        usaRespirador: false
    };

    openedDropDown = null;
    public itemsDropdown: any = [];

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
            usaRespirador: false
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
        if (this.cama.registros?.length) {
            const respirador: any[] = this.cama.registros.filter(r => r.tipo === 'respirador');
            if (respirador.length > 0) {
                this.equipos.usaRespirador = respirador.some(r => !r.fechaHasta);
            }
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

    setDropDown(relacion, drop) {
        this.openedDropDown = drop;
        if (this.openedDropDown) {
            this.openedDropDown.open = (this.openedDropDown === drop) ? true : false;
        }
        if (relacion) {
            this.openedDropDown = drop;
            this.itemsDropdown = [];
            this.itemsDropdown.push({
                label: 'Cambiar de cama',
                handler: ($event: Event) => {
                    $event.stopPropagation();
                    this.relacionesPosibles.accion = 'cambiarCama';
                    this.accionCama.emit(this.relacionesPosibles);
                }
            }, {
                label: 'Pase de unidad organizativa',
                handler: ($event: Event) => {
                    $event.stopPropagation();
                    this.relacionesPosibles.accion = 'cambiarUO';
                    this.accionCama.emit(this.relacionesPosibles);
                }
            }, {
                label: 'Egresar paciente',
                handler: ($event: Event) => {
                    $event.stopPropagation();
                    this.relacionesPosibles.accion = 'egresarPaciente';
                    this.accionCama.emit(this.relacionesPosibles);
                }
            });
        }
    }

    relacionesYcondiciones(relacion) {
        return (relacion.accion !== 'internarPaciente' && relacion.nombre !== 'Bloquear' && relacion.accion !== 'desocuparCama') || (relacion.accion === 'internarPaciente' && this.permisoIngreso)
            || (relacion.nombre === 'Bloquear' && this.permisoBloqueo);
    }

    desocupar(relacion) {
        return relacion.accion !== 'internarPaciente' && relacion.nombre !== 'Bloquear' && relacion.nombre !== 'Desbloquear';
    }
}
