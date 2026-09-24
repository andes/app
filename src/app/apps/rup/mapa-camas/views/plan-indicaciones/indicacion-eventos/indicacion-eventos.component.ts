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
    estadoItems = [];
    estado = null;
    observaciones = '';
    horarioEjecucion;
    estadoType;
    puedeEditar = false;
    agregarEditarEvento = false;
    public eventSelected;
    capa;
    public addEvent;
    public indice;
    public eventos = [
        {
            key: 'estado',
            label: 'ESTADO'
        },
        {
            key: 'creado',
            label: 'CREADO'
        },
        {
            key: 'actualizado',
            label: 'ACTUALIZADO'
        },
        {
            key: 'observaciones',
            label: 'OBSERVACIONES'
        }
    ];

    @Output() events = new EventEmitter();
    @Output() save = new EventEmitter<any>();
    @Output() edit = new EventEmitter<any>();
    public seleccionado = false;


    constructor(
        private indicacionEventosService: PlanIndicacionesEventosServices,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        private mapaCamasService: MapaCamasService,
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

        if (this.indicacion?.valor?.frecuencias?.length > 0) {
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
        this.estadoItems = [];

        this.estadoItems = [
            { id: 'realizado', nombre: 'Realizado' },
            { id: 'no-realizado', nombre: 'No realizado' },
            { id: 'incompleto', nombre: 'Incompleto' }
        ];
        if (!this.evento || (this.evento[0].estado === 'on-hold')) {
            this.agregarEvento();
        };
    }

    onCancelar() {
        this.events.emit(false);
        this.addEvent = false;
    }

    onEdit() {
        this.agregarEditarEvento = true;
        this.editando = true;
        if (this.indice < this.evento.length - 1) {
            this.horaMax = moment(this.evento[this.evento.length - 1].fecha);
        }
        this.fechaHora = moment(this.evento[this.indice].fecha).toDate();
        this.estado = this.evento[this.indice].estado;
        this.observaciones = this.evento[this.indice].observaciones;
    }

    onInputChange(value) {
        (value.value?.id === 'realizado') ? this.labelEstado = 'Observaciones' : this.labelEstado = 'Motivo';
    }
    onGuardar() {
        if (this.evento) {
            if (this.evento[this.evento.length - 1].estado === 'on-hold' || this.editando) {
                this.indicacionEventosService.update(
                    (this.indice) ? this.evento[this.indice].id : this.evento[this.evento.length - 1].id,
                    {
                        estado: this.estado.id,
                        observaciones: this.observaciones,
                        fecha: this.fechaHora
                    }
                ).subscribe(() => {
                    (this.editando) ? this.plex.toast('success', 'Evento modificado correctamente') : this.plex.toast('success', 'Evento registrado correctamente');
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
                this.indicacionEventosService.create(evento).subscribe(() => {
                    this.plex.toast('success', 'Evento registrado correctamente');
                    this.events.emit(true);
                    this.addEvent = false;
                });
            }
        } else {
            const evento = {
                idInternacion: this.indicacion.idInternacion,
                idIndicacion: this.indicacion.id,
                fecha: this.fechaHora,
                estado: this.estado.id,
                observaciones: this.observaciones
            };

            if (this.estado.id === 'realizado') {
                this.plex.confirm(
                    'El horario seleccionado no coincide con la planificación. Si continúa, los próximos eventos se modificarán. ¿Desea registrarlo de todas formas?',
                    'Atención', 'Sí', 'No'
                ).then(response => {
                    if (response) {
                        this.indicacionEventosService.create(evento).subscribe(() => {
                            this.plex.toast('success', 'Evento registrado y planificación actualizada.');
                            this.events.emit(true);
                            this.editando = false;
                        }, (error) => {
                            this.plex.toast('danger', 'Error al registrar el evento.');
                        });
                    }
                });
            } else {
                this.indicacionEventosService.create(evento).subscribe(() => {
                    this.plex.toast('success', 'Evento registrado.');
                    this.events.emit(true);
                    this.editando = false;
                }, (error) => {
                    this.plex.toast('danger', 'Error al registrar el evento.');
                });
            }
        }
    }

    agregarEvento() {
        if (this.evento) {
            this.horaMin = this.evento[this.evento.length - 1].fecha;
            this.agregarEditarEvento = true;
        }
        this.fechaHora = this.horaMin;
        this.addEvent = true;
        this.estado = null;
        this.observaciones = '';
    }

    selectedEvent(event, i) {
        this.indice = i;
        this.eventSelected = event;
    }

    getTipoEstado(estado: string) {
        switch (estado) {
            case 'realizado':
                return 'success';
            case 'no-realizado':
                return 'danger';
            case 'incompleto':
                return 'warning';
        }
    }

    onVolver() {
        this.agregarEditarEvento = false;
        this.addEvent = false;
        this.editando = false;
    }

}
