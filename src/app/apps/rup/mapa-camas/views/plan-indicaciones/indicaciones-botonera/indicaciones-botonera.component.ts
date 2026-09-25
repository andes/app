import moment from 'moment';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanIndicacionesServices } from '../../../services/plan-indicaciones.service';
import { MapaCamasService } from '../../../services/mapa-camas.service';

@Component({
    selector: '[in-plan-indicacion-botonera]',
    templateUrl: './indicaciones-botonera.component.html'
})
export class PlanIndicacionesBotoneraComponent {
    @Input() indicacion;
    @Output() refresh = new EventEmitter<any>();
    @Output() cancelIndicacion = new EventEmitter<any>();

    public items = [];
    openedDropDown = null;
    constructor(
        private planIndicacionesServices: PlanIndicacionesServices,
        private mapaCamasService: MapaCamasService,
        private plex: Plex
    ) { }

    setDropDown(indicacion, drop) {
        if (this.openedDropDown) {
            this.openedDropDown.open = (this.openedDropDown === drop) ? true : false;
        }
        if (indicacion) {
            this.items = [];
            this.openedDropDown = drop;
            this.items.push({
                label: 'Bypass', handler: ($event) => {
                    $event.stopPropagation();
                    this.cambiarEstado('bypass');
                }
            });
        }
    }

    cambiarEstado(estado: string) {
        if (estado === 'cancelled') {
            this.cancelIndicacion.emit(this.indicacion);
        } else if (estado === 'deleted') {
            this.planIndicacionesServices.delete(this.indicacion.id).subscribe(() => {
                this.refresh.emit();
                this.plex.toast('success', 'La indicación ha sido borrada');
            });
        } else {
            const estadoParams = {
                tipo: estado,
                fecha: new Date()
            };
            this.planIndicacionesServices.updateEstado(this.indicacion.id, estadoParams).subscribe(() => {
                this.refresh.emit();
                this.plex.toast('success', 'Indicaciones actualizadas');
            });
        }
    }

    mostrarDropdown() {
        if (this.mapaCamasService.capa !== 'medica') {
            return false;
        }
        const estado = this.indicacion.estadoActual;
        return estado.tipo === 'active' && moment(estado.fecha).isSame(moment(), 'day') && !estado.verificacion;
    }
}
