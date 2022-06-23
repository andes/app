import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PlanIndicacionesServices } from '../../../services/plan-indicaciones.service';

@Component({
    selector: '[in-plan-indicacion-botonera]',
    templateUrl: './indicaciones-botonera.component.html'
})
export class PlanIndicacionesBotoneraComponent implements OnChanges {
    @Input() indicacion;

    @Output() refresh = new EventEmitter<any>();
    @Output() cancelIndicacion = new EventEmitter<any>();

    public items = [];

    constructor(
        private planIndicacionesServices: PlanIndicacionesServices,
        private plex: Plex
    ) {

    }


    ngOnChanges() {
        switch (this.indicacion.estado.tipo) {
            case 'on-hold':
                this.items = [
                    this.crearItem('Continuar', 'active'),
                    this.crearItem('Suspender', 'cancelled')
                ];
                break;
            case 'completed':
                break;
            case 'stopped':
            case 'cancelled':
                break;
            case 'pending':
                this.items = [
                    this.crearItem('Continuar', 'active'),
                    this.crearItem('Suspender', 'cancelled'),
                ];
                break;
            case 'active':
                this.items = [
                    this.crearItem('Suspender', 'cancelled'),
                ];
                break;
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

    crearItem(label: string, state: string) {
        return {
            label,
            handler: ($event) => {
                $event.stopPropagation();
                this.cambiarEstado(state);
            }
        };
    }
}