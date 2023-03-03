import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PlanIndicacionesEventosServices } from '../../../services/plan-indicaciones-eventos.service';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { Auth } from '@andes/auth';
import { tap } from 'rxjs/operators';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import * as moment from 'moment';
import { Plex } from '@andes/plex';

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
    horaOrganizacion;
    horaMin;
    horaMax;
    estadoItems = [
        { id: 'realizado', nombre: 'Realizado' },
        { id: 'no-realizado', nombre: 'No realizado' },
        { id: 'incompleto', nombre: 'Incompleto' },
    ];
    estado = null;
    observaciones = '';
    horarioEjecucion;
    estadoType;
    puedeEditar = false;

    @Output() events = new EventEmitter();

    constructor(
        private indicacionEventosService: PlanIndicacionesEventosServices,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        private mapaCamasService: MapaCamasService,
        private plex: Plex
    ) { }

    ngOnChanges() {
        this.organizacionService.configuracion(this.auth.organizacion.id).pipe(
            tap(config => {
                this.horaOrganizacion = config.planIndicaciones.horaInicio;
            })
        ).subscribe(
            () => {
                this.fechaHora = moment(this.fecha).startOf('day').add(this.hora < this.horaOrganizacion ? this.hora + 24 : this.hora, 'h').toDate();
                if (!moment(this.fechaHora).isSame(moment(), 'day')) {
                    this.events.emit(false);
                }
            }
        );
        this.puedeEditar = this.mapaCamasService.capa2.getValue() === 'enfermeria';
        this.editando = this.evento?.estado === 'on-hold'; // Para nuevos eventos
        this.horaMin = moment(this.fechaHora).minutes(0);
        this.horaMax = moment(this.fechaHora).minutes(59);

        if (this.evento) {
            this.estado = this.estadoItems.find(e => e.id === this.evento.estado);
            this.observaciones = this.evento.observaciones;
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
        if (this.evento) {
            this.indicacionEventosService.update(
                this.evento.id,
                {
                    estado: this.estado.id,
                    observaciones: this.observaciones
                }
            ).subscribe(() => {
                this.events.emit(true);
                this.editando = false;
            });
        } else {
            const evento = {
                idInternacion: this.indicacion.idInternacion,
                idIndicacion: this.indicacion.id,
                fecha: this.fechaHora,
                estado: this.estado.id,
                observaciones: this.observaciones
            };
            const createReq = this.indicacionEventosService.create(evento);
            if (this.estado.id === 'realizado') {
                this.plex.confirm('El horario seleccionado no coincide con la planificación. Si continúa, los próximos eventos se modificarán. ¿Deséa registrarlo de todas formas?', 'Atención', 'Si', 'No').then(response => {
                    if (response) {
                        createReq.subscribe(() => {
                            this.events.emit(true);
                            this.editando = false;
                        });
                    }
                });
            }
        }
    }
}
