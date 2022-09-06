import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PlanIndicacionesEventosServices } from '../../../services/plan-indicaciones-eventos.service';
@Component({
    selector: 'in-plan-indicacion-evento',
    templateUrl: './indicacion-eventos.component.html'
})
export class PlanIndicacionEventoComponent implements OnChanges {
    @Input() indicacion;
    @Input() evento;
    @Input() hora;
    @Input() fecha: Date;

    fechaHora: Date;
    editando: boolean;
    estadoItems = [
        { id: 'realizado', nombre: 'Realizado' },
        { id: 'no-realizado', nombre: 'No realizado' },
        { id: 'incompleto', nombre: 'Incompleto' },
    ];
    estado = null;
    observaciones = '';
    horarioEjecucion;
    estadoType;

    @Output() events = new EventEmitter();

    constructor(private indicacionEventosService: PlanIndicacionesEventosServices) {
    }

    ngOnChanges() {
        this.fechaHora = moment(this.fecha).startOf('day').add(this.hora <= 5 ? this.hora + 24 : this.hora, 'h').toDate();
        if (this.evento) {
            this.estado = this.estadoItems.find(e => e.id === this.evento.estado);
            this.observaciones = this.evento.observaciones;
            this.editando = this.evento.estado === 'on-hold';
            this.horarioEjecucion = this.evento.updatedAt ? this.evento.updatedAt : this.evento.createdAt;
            this.estadoType = this.evento.estado === 'realizado' ? 'info' : this.evento.estado === 'no-realizado' ? 'danger' : 'warning';
        }
    }

    onCancelar() {
        this.events.emit(false);
    }

    onEdit() {
        this.editando = true;
    }

    onGuardar() {
        let saveRequest;
        if (this.evento) {
            saveRequest = this.indicacionEventosService.update(
                this.evento.id,
                {
                    estado: this.estado.id,
                    observaciones: this.observaciones
                }
            );
        } else {
            const evento = {
                idInternacion: this.indicacion.idInternacion,
                idIndicacion: this.indicacion.id,
                fecha: this.fechaHora,
                estado: this.estado.id,
                observaciones: this.observaciones
            };
            saveRequest = this.indicacionEventosService.create(evento);
        }
        saveRequest.subscribe(() => {
            this.events.emit(true);
            this.editando = false;
        });
    }
}
