import { Component, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';
import { Auth } from '@andes/auth';

export type RegistroHUDSItemAccion = 'ver' | 'continuar' | 'romper-validacion';


@Component({
    selector: 'tr[registro-huds-item]',
    templateUrl: 'registros-huds-item.component.html'
})
export class RegistroHUDSItemComponent {

    items = [
        {
            label: 'Romper Validación',
            handler: ($event: Event) => {
                $event.stopPropagation();
                this.accion.emit('romper-validacion');
            }
        }
    ];

    @Input() prestacion: IPrestacion;

    @Output() accion = new EventEmitter<RegistroHUDSItemAccion>();

    @HostBinding('style.cursor') cursor = 'pointer';

    @HostListener('click')
    onClick() {
        this.emit('ver');
    }

    constructor(
        private auth: Auth
    ) { }

    get esEjecucion() {
        const estadoPrestacion = this.prestacion.estados[this.prestacion.estados.length - 1];
        const esEjecucion = estadoPrestacion.tipo === 'ejecucion';
        return esEjecucion;
    }

    get esMiPrestacion() {
        const estadoPrestacion = this.prestacion.estados[this.prestacion.estados.length - 1];

        const createdByMe = estadoPrestacion.createdBy.id === this.auth.usuario.id;
        return createdByMe;
    }

    emit(accion: RegistroHUDSItemAccion, $event?: Event) {
        if ($event) {
            $event.stopPropagation();
        }

        this.accion.emit(accion);
    }

}
