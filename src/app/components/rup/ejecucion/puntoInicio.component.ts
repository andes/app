import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import * as moment from 'moment';

import { element } from 'protractor';

import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

// import { IOrganizacion } from './../../../interfaces/IOrganizacion';
// import { OrganizacionComponent } from './../../organizacion/organizacion.component';

import { IElementoRUP } from './../../../interfaces/IElementoRUP';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { IProfesional } from './../../../interfaces/IProfesional';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { AgendaService } from './../../../services/turnos/agenda.service';
import { ElementosRupService } from './../../../services/rup/elementosRUP.service';
import { PacienteSearch } from './../../../services/pacienteSearch.interface';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';


@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html'
})

export class PuntoInicioComponent implements OnInit {
    paciente: IPaciente;

    @HostBinding('class.plex-layout') layout = true;

    // Lista de elementos RUP en memoria
    public elementosRUP: IElementoRUP[] = [];
    // termino a buscar en Snomed
    public searchTerm: String = '';

    public listaPrestaciones: IPrestacionPaciente[] = [];
    public agendas: any = [];
    public breadcrumbs: any;

    public alerta = false;
    public mostrarLista = true;
    public mostrarPacientesSearch = true;

    public conjuntoDePrestaciones: any = [];
    public pacientesPresentes: any = [];
    public pacientesPresentesCompleto: any = [];
    public todasLasPrestaciones: any = [];
    public fechaDesde: Date;
    public fechaHasta: Date;
    public tipoPrestacionSeleccionada: any;
    public prestacionSeleccion: any;
    public estadoSeleccion: any;
    public misPacientesSeleccion = false;
    public todosSeleccion = false;
    public selectPrestacionesProfesional: any = [];


    public searchPaciente: any;
    public filtrosPacientes = true;
    public textoTipeado: string = null;

    private buscarMPI = false;

    constructor(
        private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionPacienteService,
        public servicioTipoPrestacion: TipoPrestacionService,
        private servicioElementosRUP: ElementosRupService) { }

    ngOnInit() {
        this.breadcrumbs = this.route.routeConfig.path;

        // buscamos los tipos de prestacion que tiene autorizado el usuario
        let tipoPrestacionesAuth = this.auth.getPermissions('rup:tipoPrestacion:?');

        // buscamos los elementos rup de la api
        this.servicioTipoPrestacion.get({ 'incluir': tipoPrestacionesAuth.join(',') }).subscribe(tiposPrestacion => {
            this.selectPrestacionesProfesional = tiposPrestacion;
        });

        let hoy = {
            fechaDesde: moment().startOf('day').format(),
            fechaHasta: moment().endOf('day').format()
        };

        this.fechaDesde = new Date(hoy.fechaDesde);
        this.fechaHasta = new Date(hoy.fechaHasta);
        this.loadAgendasXDia(hoy);

    }

    volverAlInicio() {
        this.paciente = null;
        this.mostrarLista = true;
    }

    /**
     * Buscar todas las prestaciones ya generadas
     *
     * @param {any} params
     *
     * @memberof PuntoInicioComponent
     */
    TraetodasLasPrestacionesFiltradas(params) {
        debugger;
        let fechaActual = new Date();
        let fechaDesde = fechaActual.setHours(0, 0, 0, 0);
        let fechaHasta = fechaActual.setHours(23, 59, 0, 0);

        this.servicioPrestacion.get({
            // turneables: true,
            fechaDesde: params.fechaDesde || fechaDesde,
            fechaHasta: params.fechaHasta || fechaHasta
        }).subscribe(resultado => {
            if (resultado) {
                this.todasLasPrestaciones = resultado;
            }
            this.cargaPacientes();
        });
    }


    /**
     * Buscamos las agendas filtradas por fecha
     * @param params : {fechaDesde: date, fechaHasta: date}
     */
    loadAgendasXDia(params) {
        if (this.auth.profesional) {
            this.servicioAgenda.get(params).subscribe(
                agendas => {
                    this.agendas = agendas;
                    this.pacientesPresentes = [];
                    this.TraetodasLasPrestacionesFiltradas(params);
                },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });

        } else {
            this.alerta = true;
        }
    }

    /**
     * Generar listado de posibles pacientes que serán o fueron atendidos
     *
     * @memberof PuntoInicioComponent
     */
    cargaPacientes() {
        this.pacientesPresentes = [];
        let unPacientePresente: any = {};

        this.agendas.forEach(agenda => {
            let turnos: any = [];
            // Recorremos los bloques de una agenda para sacar los turnos asignados.
            for (let i in agenda.bloques) {
                if (i) {
                    let turnosAsignados = agenda.bloques[i].turnos.filter(turno => (
                        (turno.estado === 'asignado') || (turno.paciente && turno.estado === 'suspendido')));
                    turnos = [...turnos, ...turnosAsignados];
                }
            }
            turnos.forEach(turno => {
                unPacientePresente.idAgenda = agenda.id;
                unPacientePresente.turno = turno;
                unPacientePresente.tipoPrestacion = turno.tipoPrestacion;
                // El estado para pacientes que aún no dieron asistencia es Programado
                unPacientePresente.estado = 'Programado';
                unPacientePresente.fecha = turno.horaInicio;
                unPacientePresente.profesionales = agenda.profesionales;
                // Cargo el tipo de prestacion y el paciente del turno
                unPacientePresente.nombrePrestacion = turno.tipoPrestacion.nombre;
                unPacientePresente.paciente = turno.paciente;

                if (turno.asistencia === 'asistio') {
                    unPacientePresente.estado = 'En espera';
                } else {
                    if (turno.estado === 'suspendido') {
                        unPacientePresente.estado = 'Suspendido';
                        unPacientePresente.fecha = turno.horaInicio;
                    }
                }

                // Buscar si existe una prestacion asociada al turno
                let prestacionTurno = this.todasLasPrestaciones.find(x => {
                    if (x.ejecucion.turno && (x.ejecucion.turno.toString() === turno._id.toString())) {
                        return x;
                    }
                });

                if (prestacionTurno) {
                    unPacientePresente.idPrestacion = prestacionTurno.id;
                    // Cargo un objeto con el profesional que realizó el ultimo cambio de estado.
                    unPacientePresente.profesionales = [prestacionTurno.estados[prestacionTurno.estados.length - 1].createdBy];
                    if (prestacionTurno.estados[(prestacionTurno.estados.length - 1)].tipo !== 'pendiente') {
                        unPacientePresente.estado = prestacionTurno.estados[prestacionTurno.estados.length - 1].tipo;
                        unPacientePresente.fecha = prestacionTurno.estados[prestacionTurno.estados.length - 1].createdAt;
                    }
                }

                this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
                unPacientePresente = {};
            });
        });

debugger;
        // Buscamos los que solo tienen prestacion y no tienen turno
        let prestacionesSinTurno = this.todasLasPrestaciones.filter(prestacion => {
            if (prestacion.ejecucion.turno === null) {
                return prestacion;
            }
        });

        prestacionesSinTurno.forEach(prestacion => {
            debugger;
            unPacientePresente.idAgenda = null;
            unPacientePresente.turno = null;
            unPacientePresente.estado = prestacion.estados[prestacion.estados.length - 1].tipo;
            unPacientePresente.fecha = prestacion.estados[prestacion.estados.length - 1].createdAt;
            unPacientePresente.profesionales = [prestacion.estados[prestacion.estados.length - 1].createdBy];

            if (unPacientePresente.estado === 'pendiente') {
                unPacientePresente.estado = 'Programado';
            }

            unPacientePresente.idPrestacion = prestacion.id;
            // //Cargo el tipo de prestacion
            unPacientePresente.nombrePrestacion = prestacion.solicitud.tipoPrestacion.term; // Recorrer las prestaciones si tiene mas de una
            // //Recorro agenda saco el estados
            unPacientePresente.paciente = prestacion.paciente;
            this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
            unPacientePresente = {};
        });


        // Ordenar los turnos y prestaciones por fecha y hora
        this.pacientesPresentes = this.pacientesPresentes.sort((a, b) => { return (a.fecha > b.fecha) ? 1 : ((b.fecha > a.fecha) ? -1 : 0); });
        this.pacientesPresentesCompleto = [... this.pacientesPresentes];

        this.filtrarPacientes(this.filtrosPacientes);
    }


    onPacienteSelected(paciente: IPaciente): void {
        this.paciente = paciente;
        this.mostrarPacientesSearch = false;
        this.mostrarLista = false;
    }

    /**
     * Crear prestaciones para pacientes que no tienen turno pero se atienden igual
     *
     *
     * @memberof PuntoInicioComponent
     */
    crearPrestacionVacia() {
        let conceptoSnomed = this.tipoPrestacionSeleccionada;
        let nuevaPrestacion;
        nuevaPrestacion = {
            /*
            paciente: {
                id: this.paciente.id,
                nombre: this.paciente.nombre,
                apellido: this.paciente.apellido,
                documento: this.paciente.documento,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento
            },
            */
            solicitud: {
                tipoPrestacion: conceptoSnomed,
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
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
            },
            ejecucion: {
                fecha: new Date(),
                turno: null,
                registros: [],
                // profesionales:[] falta asignar.. para obtener el nombre ver si va a venir en token

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


        //nuevaPrestacion.paciente['_id'] = this.paciente.id;

        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            this.plex.alert('Prestación creada.').then(() => {
                this.router.navigate(['/rup/ejecucion', prestacion.id]);
            });
        }, (err) => {
            //this.plex.toast('danger', 'ERROR: No fue posible crear la prestación');
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
                if (prestacion) {
                    this.router.navigate(['/rup/ejecucion', prestacion.id]);
                } else {
                    this.plex.alert('ERROR: no se pudo cargar la prestación');
                }
            });
        }
    }


    /**
     * Cargar combo de prestaciones que puede ver o agregar el profesional para filtrar
     * @param {any} $event
     * @returns
     *
     * @memberof PuntoInicioComponent
     */
    loadPrestacionesProfesional($event) {
        return $event.callback(this.selectPrestacionesProfesional);
    }

    /**
     * Cargar combo de estados para filtrar prestaciones
     * @param {any} $event
     * @returns
     *
     * @memberof PuntoInicioComponent
     */
    loadEstados($event) {
        return $event.callback([{ id: 'Programado', nombre: 'Programado' }, { id: 'En espera', nombre: 'En espera' }, { id: 'ejecucion', nombre: 'En ejecución' }, { id: 'validada', nombre: 'Validada' }, { id: 'Suspendido', nombre: 'Suspendido' }]);
    }


    /**
     * Regenerar el listado de agendas filtradas por fechas
     *
     * @memberof PuntoInicioComponent
     */
    filtrarPorFecha() {
        this.todasLasPrestaciones = [];
        // this.pacientesPresentes = [];
        let fechaDesde = moment(this.fechaDesde).startOf('day');
        let fechaHasta = moment(this.fechaHasta).endOf('day');

        if (fechaDesde.isValid() && fechaHasta.isValid()) {
            let params = {
                fechaDesde: fechaDesde.format(),
                fechaHasta: fechaHasta.format()
            };
            this.loadAgendasXDia(params);

        } else {
            this.plex.info('danger', 'ERROR: fechas invalidas');
        }
    }

    /**
     * Filtrar el listado de pacientes
     *
     * @param {boolean} misPacientes: solo listar los pacientes del profesional
     *
     * @memberof PuntoInicioComponent
     */
    filtrarPacientes(misPacientes: boolean) {
        this.filtrosPacientes = misPacientes;
        let usu = this.auth.usuario;
        let listadoFiltrado = [... this.pacientesPresentesCompleto];

        // solo los pacientes del profesional logueado
        if (this.filtrosPacientes) {
            listadoFiltrado = listadoFiltrado.filter(paciente => {
                if (paciente.profesionales.length > 0) {
                    let profesional = paciente.profesionales.find(profesional => {
                        // Si la prestacion ya esta en ejecucion tengo el documento del profesional
                        if (profesional.documento) {
                            if (profesional.documento === this.auth.usuario.username) {
                                return profesional;
                            }
                        } else {
                            if (profesional.id === this.auth.profesional.id) {
                                return profesional;
                            }
                        }
                    });
                    if (profesional) {
                        return paciente;
                    }
                }
            });
        }

        // por tipo de prestación
        if (this.prestacionSeleccion) {
            listadoFiltrado = listadoFiltrado.filter(paciente => {
                if (paciente.nombrePrestacion === this.prestacionSeleccion.nombre) {
                    return paciente;
                }
            });
        }

        // por estado
        if (this.estadoSeleccion) {
            listadoFiltrado = listadoFiltrado.filter(paciente => {
                if (paciente.estado === this.estadoSeleccion.id) {
                    return paciente;
                }
            });
        }

        this.pacientesPresentes = [...listadoFiltrado];

    }


    /**************** RELACION CON MPI **********************/

    /**
     * @returns Realiza la búsqueda de pacientes localmente y si no existe lo busca en mpi
     *
     * @memberof PuntoInicioComponent
     */
    buscar() {
        this.cargaPacientes();

        let pacientesFiltrados: any = [];
        if (this.searchTerm) {
            let search = this.searchTerm.toUpperCase();
            pacientesFiltrados = this.pacientesPresentes.filter(paciente => {
                let nombreCompleto = paciente.paciente.apellido + ' ' + paciente.paciente.nombre;
                if (nombreCompleto.indexOf(search) !== -1 || paciente.paciente.nombre.indexOf(search) !== -1 || paciente.paciente.apellido.indexOf(search) !== -1 || paciente.paciente.documento.indexOf(search) !== -1) {
                    return paciente;
                }
            });
            this.pacientesPresentes = pacientesFiltrados;
            if (this.pacientesPresentes.length <= 0 && this.searchTerm.length > 0) {
                this.buscarMPI = true;
            } else {
                this.buscarMPI = false;
            }
        }
    }


    /**
     * Reinicia la búsqueda en la tabla de acuerdo al output de componente pacienteSearch
     *
     * @param {any} event
     *
     * @memberof PuntoInicioComponent
     */
    handleBlanqueo(event) {
        this.buscarMPI = false;
        this.searchTerm = null;
        this.volverAlInicio();
        this.cargaPacientes();
    }

    /**************** /RELACION CON MPI **********************/

    onReturn() {
        this.router.navigate(['/rup']);
    }

    irResumen(id) {
        this.router.navigate(['rup/validacion/', id]);
    }
} // export class Punto Inicio Component


