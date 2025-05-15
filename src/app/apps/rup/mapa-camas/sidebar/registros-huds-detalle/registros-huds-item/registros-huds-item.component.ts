import { Component, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Plex } from '@andes/plex';

export type RegistroHUDSItemAccion = 'ver' | 'verProtocolo' | 'continuar' | 'romper-validacion' | 'anular-validacion' | 'cda';


@Component({
    selector: 'tr[registro-huds-item]',
    templateUrl: 'registros-huds-item.component.html'
})
export class RegistroHUDSItemComponent {

    capa$ = this.mapaCamasService.capa2;
    public esProfesional = this.auth.profesional;

    items = [
        {
            label: 'Romper Validación',
            handler: ($event: Event) => {
                $event.stopPropagation();
                this.accion.emit('romper-validacion');
            }
        }
    ];

    @Input() prestacion;

    @Output() accion = new EventEmitter<RegistroHUDSItemAccion>();

    @HostBinding('style.cursor') cursor = 'pointer';

    @HostListener('click')
    onClick() {
        this.emit('ver');
    }

    constructor(
        private plex: Plex,
        private auth: Auth,
        private mapaCamasService: MapaCamasService,
    ) { }

    get esEjecucion() {
        if (this.prestacion.estados) {
            const estadoPrestacion = this.prestacion.estados[this.prestacion.estados.length - 1];
            const esEjecucion = estadoPrestacion.tipo === 'ejecucion';
            return esEjecucion;
        }
    }

    get esMiPrestacion() {
        if (this.prestacion.estados) {
            const estadoPrestacion = this.prestacion.estados[this.prestacion.estados.length - 1];

            const createdByMe = estadoPrestacion.createdBy.id === this.auth.usuario.id;
            return createdByMe;
        }
    }

    emit(accion: RegistroHUDSItemAccion, $event?: Event) {
        if ($event) {
            $event.stopPropagation();
        }

        this.accion.emit(accion);
    }

    invalidarPrestacion(accion: RegistroHUDSItemAccion, $event?: Event) {
        if ($event) {
            $event.stopPropagation();
        }
        this.plex.confirm('¿Está seguro que desea invalidar este registro?').then(confirmacion => {
            if (confirmacion) {
                this.accion.emit(accion);
            }
        });
    }

}
