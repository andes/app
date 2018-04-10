import { PrestacionesService } from './../../services/prestaciones.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';
import { ITipoPrestacion } from '../../../../interfaces/ITipoPrestacion';

@Component({
    templateUrl: 'prestacionCrear.html'
})
export class PrestacionCrearComponent implements OnInit {
    prestacionAutocitar: any;
    showAutocitar = false;
    agendasAutocitar: IAgenda[];
    // solicitudPrestacion: {
    //     paciente: IPaciente;
    //     registros: { nombre: String; concepto: any; valor: { solicitudPrestacion: any; }; tipo: string; }; solicitudPrestacion: ITipoPrestacion; };
    solicitudPrestacion: any;
    solicitudTurno: any;
    agendasAutocitacion: IAgenda[];
    opcion: any;
    @HostBinding('class.plex-layout') layout = true;

    // Fecha seleccionada
    public fecha: Date = new Date();
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: ITipoPrestacion[] = [];
    // Tipos de prestacion seleccionada
    public tipoPrestacionSeleccionada: ITipoPrestacion;
    // Paciente sleccionado
    public paciente: IPaciente;
    public buscandoPaciente = false;

    /**
     * Indica si muestra el calendario para dar turno autocitado
     */
    public showDarTurnos = false;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        private location: Location) { }

    ngOnInit() {
        // Carga tipos de prestaciones permitidas para el usuario
        this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
            this.tiposPrestacion = data;
        });

        this.route.params.subscribe(params => {
            this.opcion = params['opcion'];
        });

    }

    onPacienteSelected(paciente: IPaciente) {
        if (paciente.id) {
            this.paciente = paciente;
            this.buscandoPaciente = false;
        } else {
            this.plex.alert('El paciente debe ser registrado en MPI');
        }
    }

    onPacienteCancel() {
        this.buscandoPaciente = false;
    }

    cancelarAutocitar() {
        this.showAutocitar = false;
        this.paciente = null;
        this.onReturn();
    }

    /**
     * Vuelve a la página anterior
     */
    cancelar() {
        this.location.back();
    }

    existePaciente(): void {
        if (!this.paciente) {
            this.plex.info('warning', 'Debe seleccionar un paciente');
            return;
        }
    }

    /**
     * Guarda e inicia la Prestación
     */
    iniciarPrestacion() {

        this.existePaciente();

        let conceptoSnomed = this.tipoPrestacionSeleccionada;
        let nuevaPrestacion;
        nuevaPrestacion = {
            paciente: {
                id: this.paciente.id,
                nombre: this.paciente.nombre,
                apellido: this.paciente.apellido,
                documento: this.paciente.documento,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento
            },
            solicitud: {
                fecha: this.fecha,
                tipoPrestacion: conceptoSnomed,
                // profesional logueado
                profesional:
                    {
                        id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                    },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
            },
            ejecucion: {
                fecha: this.fecha,
                registros: [],
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
            },
            estados: {
                fecha: new Date(),
                tipo: 'ejecucion'
            }
        };

        nuevaPrestacion.paciente['_id'] = this.paciente.id;
        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            localStorage.removeItem('idAgenda');
            this.router.navigate(['/rup/ejecucion', prestacion.id]);
        }, (err) => {
            this.plex.info('danger', 'La prestación no pudo ser registrada. Por favor verifica la conectividad de la red.');
        });
    }

    darTurnoAutocitado() {

        // Hay paciente?
        this.existePaciente();

        let params = {
            disponiblesProfesional: true,
            idTipoPrestacion: this.tipoPrestacionSeleccionada.id,
            fechaDesde: moment(new Date()).startOf('day'),
            fechaHasta: moment(new Date()).endOf('month'),
            estados: ['disponible', 'publicada'],
            organizacion: this.auth.organizacion.id
        };
        this.servicioAgenda.get(params).subscribe(agendas => {
            this.agendasAutocitar = agendas;
            this.prestacionAutocitar = this.tipoPrestacionSeleccionada;
            this.servicioPrestacion.crearPrestacion(this.paciente, this.tipoPrestacionSeleccionada.id, 'solicitud', (new Date()), null);
            this.showAutocitar = true;
        });
    }

    /** * Se selecciona un turno o paciente. Si la prestacion no existe la creamos en este momento
     *
     * @param {any} unPacientePresente
     *
     * @memberof PuntoInicioComponent
     */
    elegirPrestacion(unPacientePresente) {
        if (unPacientePresente.idPrestacion) {

            if (unPacientePresente.estado === 'Programado') {
                let cambioEstado: any = {
                    op: 'estadoPush',
                    estado: { tipo: 'ejecucion' }
                };

                // Vamos a cambiar el estado de la prestación a ejecucion
                this.servicioPrestacion.patch(unPacientePresente.idPrestacion, cambioEstado).subscribe(prestacion => {
                    this.router.navigate(['/rup/ejecucion', unPacientePresente.idPrestacion]);
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible iniciar la prestación');
                });
            } else {
                this.router.navigate(['/rup/ejecucion', unPacientePresente.idPrestacion]);
            }
        } else {
            // TODO: REVISAR
            // Marcar la asistencia al turno
            if (unPacientePresente.estado !== 'Suspendido' && unPacientePresente.turno.asistencia !== 'asistio') {
                let patch: any = {
                    op: 'darAsistencia',
                    turnos: [unPacientePresente.turno]
                };
                this.servicioAgenda.patchMultiple(unPacientePresente.idAgenda, patch).subscribe(resultado => {
                    if (resultado) {
                        // TODO: Ver si se muestra un mensaje
                    }
                });
            }
            // Si aún no existe la prestación creada vamos a generarla
            let nuevaPrestacion;
            nuevaPrestacion = {
                paciente: {
                    id: unPacientePresente.paciente.id,
                    nombre: unPacientePresente.paciente.nombre,
                    apellido: unPacientePresente.paciente.apellido,
                    documento: unPacientePresente.paciente.documento,
                    sexo: unPacientePresente.paciente.sexo,
                    fechaNacimiento: unPacientePresente.paciente.fechaNacimiento
                },
                solicitud: {
                    tipoPrestacion: unPacientePresente.tipoPrestacion,
                    fecha: new Date(),
                    hallazgos: [],
                    prestacionOrigen: null,
                    // profesional logueado
                    profesional:
                        {
                            id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                            apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                        },
                    // organizacion desde la que se solicita la prestacion
                    organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.id.nombre },
                },
                ejecucion: {
                    fecha: new Date(),
                    registros: [],
                    turno: unPacientePresente.turno.id,
                    // organizacion desde la que se solicita la prestacion
                    organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.id.nombre }
                },
                estados: {
                    fecha: new Date(),
                    tipo: 'ejecucion'
                }
            };
            this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                this.router.navigate(['/rup/ejecucion', prestacion.id]);
            });
        }
    }

    onReturn() {
        this.router.navigate(['/rup']);
    }

    irResumen(id) {
        this.router.navigate(['rup/validacion/', id]);
    }
}
