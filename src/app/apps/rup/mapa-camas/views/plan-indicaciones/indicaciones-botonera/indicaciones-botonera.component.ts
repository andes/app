import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { PlanIndicacionesEventosServices } from '../../../services/plan-indicaciones-eventos.service';
import { PlanIndicacionesServices } from '../../../services/plan-indicaciones.service';

@Component({
    selector: '[in-plan-indicacion-botonera]',
    templateUrl: './indicaciones-botonera.component.html'
})
export class PlanIndicacionesBotoneraComponent implements OnChanges {
    @Input() indicacion;

    @Output() refresh = new EventEmitter<any>();

    public items = [];

    constructor(
        private planIndicacionesServices: PlanIndicacionesServices,
        private indicacionEventosService: PlanIndicacionesEventosServices,
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
                    this.crearItem('Pausar', 'on-hold'),
                    this.crearItem('Suspender', 'cancelled'),
                    this.crearItem('Finalizar', 'completed')
                ];
                break;
            case 'active':
                this.items = [
                    this.crearItem('Pausar', 'on-hold'),
                    this.crearItem('Suspender', 'cancelled'),
                    this.crearItem('Finalizar', 'completed')
                ];
                break;
            case 'draft':
                this.items = [
                    this.crearItem('Eliminar', 'deleted'),
                ];
        }
    }

    cambiarEstado(estado: string) {
        if (estado === 'deleted') {
            this.planIndicacionesServices.delete(this.indicacion.id).subscribe(() => {
                this.refresh.emit();
                this.plex.toast('success', 'La indicación ha sido borrada');
            });
        } else if (estado === 'active') {
            this.setHorarios();
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

    setHorarios() {
        this.indicacion.valor.frecuencias.forEach(frecuencia => {
            this.indicacionEventosService.getLastEvent(this.indicacion).pipe(
                switchMap((evento: any) => {
                    if (evento) {
                        frecuencia.horario = moment(evento.fecha).add(frecuencia.frecuencia.targetValue, 'hours').toDate();
                    }
                    return this.planIndicacionesServices.getHorarios(this.indicacion, frecuencia);
                }),
                switchMap(horarios => this.indicacionEventosService.create(horarios))
            ).subscribe(() => {
                this.refresh.emit();
            });
        });
    }
}
