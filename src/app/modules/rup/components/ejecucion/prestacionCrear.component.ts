import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { concat, forkJoin, switchMap } from 'rxjs';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { ITipoPrestacion } from '../../../../interfaces/ITipoPrestacion';
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';
import { ObraSocialCacheService } from '../../../../services/obraSocialCache.service';
import { HUDSService } from '../../services/huds.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { PacienteRestringidoPipe } from 'src/app/pipes/pacienteRestringido.pipe';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';

@Component({
    selector: 'prestacion-crear',
    templateUrl: 'prestacionCrear.html',
    styleUrls: ['prestacionCrear.scss']
})
export class PrestacionCrearComponent implements OnInit, OnChanges {
    pacienteFields = ['sexo', 'financiador', 'lugarNacimiento'];
    prestacionAutocitar: any;
    showAutocitar = false;
    agendasAutocitar: IAgenda[];
    solicitudPrestacion: any;
    solicitudTurno: any;
    agendasAutocitacion: IAgenda[];

    @Input() opcion: string;

    @Output() mostrar = new EventEmitter();

    // Fecha seleccionada
    public fecha: Date = new Date();
    public max: Date = new Date();

    // Tipos de prestacion seleccionada
    public tipoPrestacionSeleccionada: ITipoPrestacion;
    // Paciente sleccionado
    public paciente: IPaciente;
    // segun el tipo de prestación elegida se selecciona paciente o no
    public mostrarPaciente = false;
    public loading = false;
    public disableGuardar = false;
    public resultadoBusqueda = null;
    public tieneAccesoHUDS: Boolean;
    /**
     * Indica si muestra el calendario para dar turno autocitado
     */
    public showDarTurnos = false;

    constructor(
        private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionesService,
        private osService: ObraSocialCacheService,
        private pacienteService: PacienteService,
        private hudsService: HUDSService,
        private pacienteRestringido: PacienteRestringidoPipe,
        public motivosHudsService: MotivosHudsService

    ) { }

    ngOnInit() {
        this.tieneAccesoHUDS = this.auth.check('huds:visualizacionHuds');

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

    ngOnChanges(changes: SimpleChanges) {
        if (changes['opcion']) {
            this.fecha = moment().toDate();
            this.max = moment().toDate();
            this.resultadoBusqueda = null;
            this.paciente = null;
            this.tipoPrestacionSeleccionada = null;
        }
    }

    cancelarAutocitar() {
        this.showAutocitar = false;
        this.paciente = null;
        this.tipoPrestacionSeleccionada = null;
        this.cancelar();
    }

    seleccionarTipoPrestacion() {
        this.onSearchClear();
        this.mostrarPaciente = this.tipoPrestacionSeleccionada && !this.tipoPrestacionSeleccionada.noNominalizada;
    }

    cancelar() {
        this.mostrar.emit();
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
            const conceptoSnomed = this.tipoPrestacionSeleccionada;
            const nuevaPrestacion = {
                paciente: this.paciente && {
                    id: this.paciente.id,
                    nombre: this.paciente.nombre,
                    alias: this.paciente.alias,
                    apellido: this.paciente.apellido,
                    documento: this.paciente.documento,
                    numeroIdentificacion: this.paciente.numeroIdentificacion,
                    sexo: this.paciente.sexo,
                    fechaNacimiento: this.paciente.fechaNacimiento,
                    obraSocial: obraSocialPaciente,
                    genero: this.paciente.genero
                },
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
            if (this.tieneAccesoHUDS && this.paciente) {
                const motivo = this.motivosHudsService.getMotivo('rup-fuera-agenda');
                nuevaPrestacion.paciente['_id'] = this.paciente.id;
                const token = motivo.pipe(
                    switchMap(motivoH => {
                        const paramsToken = {
                            usuario: this.auth.usuario,
                            organizacion: this.auth.organizacion,
                            paciente: this.paciente,
                            motivo: motivoH[0].key,
                            profesional: this.auth.profesional,
                            idTurno: null,
                            idPrestacion: this.tipoPrestacionSeleccionada.id
                        };
                        return this.hudsService.generateHudsToken(paramsToken);
                    })
                );
                const nuevaPrest = this.servicioPrestacion.post(nuevaPrestacion);
                concat(token, nuevaPrest).subscribe({
                    next: input => {
                        if (input.token) {
                            // se obtuvo token y loguea el acceso a la huds del paciente
                            window.sessionStorage.setItem('huds-token', input.token);
                        } else {
                            this.router.navigate(['/rup/ejecucion', input.id]); // prestacion
                        }
                    },
                    error: err => this.plex.info('danger', 'La prestación no pudo ser registrada. ' + err)
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
        const params = {
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
                const cambioEstado: any = {
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
                const patch: any = {
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
            const nuevaPrestacion = {
                paciente: {
                    id: this.paciente.id,
                    nombre: this.paciente.nombre,
                    alias: this.paciente.alias,
                    apellido: this.paciente.apellido,
                    documento: this.paciente.documento,
                    numeroIdentificacion: this.paciente.numeroIdentificacion,
                    sexo: this.paciente.sexo,
                    fechaNacimiento: this.paciente.fechaNacimiento,
                    genero: this.paciente.genero
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
        this.resultadoBusqueda = null;
        this.paciente = null;
    }

    esPacienteRestringido(paciente: IPaciente) {
        return this.pacienteRestringido.transform(paciente);
    }

    // ----------------------------------

    // Componente paciente-listado

    onSelect(paciente: IPaciente): void {
        // Es un paciente existente en ANDES??
        if (paciente && paciente.id) {
            if (!this.esPacienteRestringido(paciente)) {
                // Si se seleccionó por error un paciente fallecido
                this.pacienteService.checkFallecido(paciente);
                this.paciente = paciente;
                this.resultadoBusqueda = [this.paciente];
                this.darTurnoAutocitado();
            } else {
                this.plex.info('warning', 'No tiene permisos para acceder a este paciente.');
            }
        } else {
            this.plex.info('warning', 'Paciente no encontrado', '¡Error!');
        }
    }
}
