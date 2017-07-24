import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IElementoRUP } from './../../../interfaces/IElementoRUP';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { IProfesional } from './../../../interfaces/IProfesional';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { PacienteSearch } from './../../../services/pacienteSearch.interface';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';

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

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionPacienteService,
        public servicioTipoPrestacion: TipoPrestacionService,
        private location: Location) { }

    ngOnInit() {
        // Carga tipos de prestaciones permitidas para el usuario
        this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
            this.tiposPrestacion = data;
        });
    }

    onPacienteSelected(paciente: IPaciente) {
        this.paciente = paciente;
        this.buscandoPaciente = false;
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
     * Guarda la prestación (presupone que el formulario es válido)
     */
    guardar() {
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
            this.plex.alert('Prestación creada.').then(() => {
                this.router.navigate(['/rup/ejecucion', prestacion.id]);
            });
        }, (err) => {
            this.plex.toast('danger', 'ERROR: No fue posible crear la prestación');
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

    /**************** /RELACION CON MPI **********************/

    onReturn() {
        this.router.navigate(['/rup']);
    }

    irResumen(id) {
        this.router.navigate(['rup/validacion/', id]);
    }
} // export class Punto Inicio Component


