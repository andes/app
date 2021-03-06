import { PrestacionesService } from './../../services/prestaciones.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';
import { ITipoPrestacion } from '../../../../interfaces/ITipoPrestacion';
import { ObraSocialCacheService } from '../../../../services/obraSocialCache.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';
import { concat, forkJoin } from 'rxjs';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';

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
    // @HostBinding('class.plex-layout') layout = true;

    // Fecha seleccionada
    public fecha: Date = new Date();
    public max: Date = new Date();

    // Tipos de prestacion seleccionada
    public tipoPrestacionSeleccionada: ITipoPrestacion;
    // Paciente sleccionado
    public paciente: IPaciente;
    public buscandoPaciente = false;
    // segun el tipo de prestación elegida se selecciona paciente o no
    public mostrarPaciente = false;
    public loading = false;
    public disableGuardar = false;
    public resultadoBusqueda = [];
    public tieneAccesoHUDS: Boolean;
    /**
     * Indica si muestra el calendario para dar turno autocitado
     */
    public showDarTurnos = false;

    get btnLabel() {
        if (this.opcion === 'fueraAgenda') {
            return 'INICIAR PRESTACIÓN';
        } else {
            return 'DAR TURNO AUTOCITADO';
        }
    }

    btnClick() {
        if (this.opcion === 'fueraAgenda') {
            this.iniciarPrestacion();
        } else {
            this.darTurnoAutocitado();
        }
    }

    constructor(private router: Router,
        private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionesService,
        private location: Location,
        private osService: ObraSocialCacheService,
        private pacienteService: PacienteService,
        private hudsService: HUDSService) { }

    ngOnInit() {
        this.tieneAccesoHUDS = this.auth.check('huds:visualizacionHuds');


        this.route.params.subscribe(params => {
            this.opcion = params['opcion'];
        });

        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/rup',
            name: 'RUP'
        }, {
            name: this.opcion === 'fueraAgenda' ? 'Fuera de Agenda' : 'Autocitado'
        }]);
    }



    onPacienteCancel() {
        this.buscandoPaciente = false;
    }

    cancelarAutocitar() {
        this.showAutocitar = false;
        this.paciente = null;
        this.onReturn();
    }

    seleccionarTipoPrestacion() {
        this.onSearchClear();
        this.mostrarPaciente = this.tipoPrestacionSeleccionada && !this.tipoPrestacionSeleccionada.noNominalizada;
    }

    showBuscarPaciente() {
        this.buscandoPaciente = true;
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
        let obraSocialPaciente;
        this.osService.getFinanciadorPacienteCache().subscribe((financiador) => {
            obraSocialPaciente = financiador;
        });
        if (this.tipoPrestacionSeleccionada) {
            let pacientePrestacion = undefined;
            if (!this.tipoPrestacionSeleccionada.noNominalizada) {
                this.existePaciente();
                pacientePrestacion = {
                    id: this.paciente.id,
                    nombre: this.paciente.nombre,
                    apellido: this.paciente.apellido,
                    documento: this.paciente.documento,
                    sexo: this.paciente.sexo,
                    fechaNacimiento: this.paciente.fechaNacimiento,
                    obraSocial: obraSocialPaciente
                };
            }
            let conceptoSnomed = this.tipoPrestacionSeleccionada;
            let nuevaPrestacion;
            nuevaPrestacion = {
                paciente: pacientePrestacion,
                solicitud: {
                    fecha: this.fecha,
                    tipoPrestacion: conceptoSnomed,
                    // profesional logueado
                    profesional: {
                        id: this.auth.profesional,
                        nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido,
                        documento: this.auth.usuario.documento
                    },
                    // organizacion desde la que se solicita la prestacion
                    organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                },
                ejecucion: {
                    fecha: this.fecha,
                    registros: [],
                    // organizacion desde la que se solicita la prestación
                    organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
                },
                estados: [{
                    fecha: new Date(),
                    tipo: 'ejecucion'
                }]
            };
            this.disableGuardar = true;
            if (this.tieneAccesoHUDS && pacientePrestacion) {
                nuevaPrestacion.paciente['_id'] = this.paciente.id;

                const token = this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, this.paciente, 'Fuera de agenda', this.auth.profesional, null, this.tipoPrestacionSeleccionada.id);
                const nuevaPrest = this.servicioPrestacion.post(nuevaPrestacion);
                const res = concat(token, nuevaPrest);

                res.subscribe(input => {
                    if (input.token) {
                        // se obtuvo token y loguea el acceso a la huds del paciente
                        window.sessionStorage.setItem('huds-token', input.token);
                    } else {
                        this.router.navigate(['/rup/ejecucion', input.id]); // prestacion
                    }
                }, (err) => {
                    this.plex.info('danger', 'La prestación no pudo ser registrada. ' + err);
                });
            } else {
                this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                    this.router.navigate(['/rup/ejecucion', prestacion.id]);
                }, (err) => {
                    this.disableGuardar = false;
                    this.plex.info('danger', 'La prestación no pudo ser registrada. ' + err);
                });

            }

        }
    }

    darTurnoAutocitado() {

        // Hay paciente?
        this.existePaciente();
        let params = {
            disponiblesProfesional: true,
            idTipoPrestacion: this.tipoPrestacionSeleccionada.id,
            fechaDesde: moment(new Date()).startOf('day').toDate(),
            estados: ['disponible', 'publicada'],
            organizacion: this.auth.organizacion.id,
            profesionales: [this.auth.profesional]
        };

        forkJoin([
            this.pacienteService.getById(this.paciente.id),
            this.servicioAgenda.get(params)
        ]).subscribe(([paciente, agendas]) => {
            this.paciente = paciente;
            this.agendasAutocitar = agendas;
            this.prestacionAutocitar = this.tipoPrestacionSeleccionada;
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
                    profesional: {
                        id: this.auth.profesional,
                        nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido,
                        documento: this.auth.usuario.documento
                    },
                    // organizacion desde la que se solicita la prestacion
                    organizacion: {
                        id: this.auth.organizacion.id,
                        nombre: this.auth.organizacion.nombre
                    },
                },
                ejecucion: {
                    fecha: new Date(),
                    registros: [],
                    turno: unPacientePresente.turno.id,
                    // organizacion desde la que se solicita la prestacion
                    organizacion: {
                        id: this.auth.organizacion.id,
                        nombre: this.auth.organizacion.nombre
                    }
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

    // -------------- SOBRE BUSCADOR PACIENTES ----------------

    searchStart() {
        this.paciente = null;
        this.loading = true;
    }

    searchEnd(resultado) {
        this.loading = false;
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.resultadoBusqueda = resultado.pacientes;
    }

    onSearchClear() {
        this.resultadoBusqueda = [];
        this.paciente = null;
    }

    // ----------------------------------

    // Componente paciente-listado

    onSelect(paciente: IPaciente): void {
        // Es un paciente existente en ANDES??
        if (paciente && paciente.id) {
            // Si se seleccionó por error un paciente fallecido
            this.pacienteService.checkFallecido(paciente);
            this.paciente = paciente;
            this.buscandoPaciente = false;
        } else {
            this.plex.info('warning', 'Paciente no encontrado', '¡Error!');
        }
        this.resultadoBusqueda = [];
    }
}
