import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PlanIndicacionesEventosServices } from '../../../services/plan-indicaciones-eventos.service';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { Auth } from '@andes/auth';
import { tap } from 'rxjs/operators';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import * as moment from 'moment';
import { Plex } from '@andes/plex';
import { PlanIndicacionesServices } from '../../../services/plan-indicaciones.service';

@Component({
    selector: 'in-plan-indicacion-evento',
    templateUrl: './indicacion-eventos.component.html',
})
export class PlanIndicacionEventoComponent implements OnChanges {
    @Input() indicacion;
    @Input() evento;
    @Input() hora;
    @Input() fecha: Date;
    labelEstado = 'Observaciones';
    fechaHora: Date;
    editando: boolean;
    horaOrganizacion;
    public frecuenciaDelMedico: any = null;
    public horarioPlanificado: any = null;
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
    capa;

    @Output() events = new EventEmitter();
    @Output() save = new EventEmitter<any>();
    @Output() edit = new EventEmitter<any>();
    public seleccionado = false;


    constructor(
        private indicacionEventosService: PlanIndicacionesEventosServices,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        private mapaCamasService: MapaCamasService,
        private planIndicacionesServices: PlanIndicacionesServices,
        private plex: Plex
    ) { }

    ngOnChanges() {
        this.capa = this.mapaCamasService.capa;
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
        this.editando = !this.evento || this.evento.estado === 'on-hold' || this.evento.estado === 'bypass';

        this.horaMin = moment(this.fechaHora).minutes(0);
        this.horaMax = moment(this.fechaHora).minutes(59);

        if (this.indicacion && this.indicacion.valor && this.indicacion.valor.frecuencias && this.indicacion.valor.frecuencias.length > 0) {
            const frecuenciaGuardada = this.indicacion.valor.frecuencias[0];
            this.frecuenciaDelMedico = frecuenciaGuardada.frecuencia;
            this.horarioPlanificado = frecuenciaGuardada.horario;
        }


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

    onInputChange(value) {
        (value.value?.id === 'realizado') ? this.labelEstado = 'Observaciones' : this.labelEstado = 'Motivo';
    }
    onGuardar() {
        const evento = {
            _id: this.evento?._id,
            idInternacion: this.indicacion.idInternacion,
            idIndicacion: this.indicacion.id,
            fecha: this.fechaHora,
            estado: this.estado.id,
            observaciones: this.observaciones
        };
        this.indicacionEventosService.search({
            idInternacion: this.indicacion.idInternacion,
            idIndicacion: this.indicacion.id,
            fecha: this.fechaHora
        }).subscribe(eventos => {
            if (eventos?.length > 0) {
                const eventoExistente = eventos[0];
                this.indicacionEventosService.update(eventoExistente._id, evento).subscribe(() => {
                    this.finalizarEvento(true);
                }, () => this.plex.toast('danger', 'Error al actualizar evento'));
            } else {
                this.indicacionEventosService.create(evento).subscribe(() => {
                    this.finalizarEvento(false);
                }, () => this.plex.toast('danger', 'Error al crear evento'));
            }
        });
    }

    private finalizarEvento(editado: boolean) {
        if (this.estado.id === 'realizado') {
            if (this.indicacion.valor?.frecuencias?.length > 0) {
                this.indicacion.valor.frecuencias[0].horario = this.fechaHora;
            }
            this.edit.emit(this.indicacion);
        }
        this.events.emit(true);
        this.editando = false;
        this.plex.toast('success', editado ? 'Evento actualizado con éxito' : 'Evento creado con éxito');
    }
}
