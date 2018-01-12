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

@Component({
    templateUrl: 'prestacionCrear.html'
})
export class PrestacionCrearComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    // Fecha seleccionada
    public fecha: Date = new Date();
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // Tipos de prestacion seleccionada
    public tipoPrestacionSeleccionada: any;
    // Paciente sleccionado
    public paciente: IPaciente;
    public buscandoPaciente = false;
    public btnCancelarLabel = 'CANCELAR';

    constructor(private router: Router,
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

    /**
     * Vuelve a la página anterior
     */
    cancelar() {
        this.location.back();
    }

    /**
     * Guarda la prestación
     */
    guardar(formValid) {
        if (!this.paciente || !formValid) {
            return;
        }

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
            this.router.navigate(['/rup/ejecucion', prestacion.id]);
        }, (err) => {
            this.plex.info('danger', 'La prestación no pudo ser registrada. Por favor verifica la conectividad de la red.');
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
                    // profesionales:[] falta asignar.. para obtener el nombre ver si va a venir en token

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
