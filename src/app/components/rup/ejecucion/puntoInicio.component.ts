import { element } from 'protractor';
import { IOrganizacion } from './../../../interfaces/IOrganizacion';
import { OrganizacionComponent } from './../../organizacion/organizacion.component';
import { IProfesional } from './../../../interfaces/IProfesional';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
// Rutas
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html'
})

export class PuntoInicioComponent implements OnInit {
    paciente: IPaciente;

    @HostBinding('class.plex-layout') layout = true;

    public profesional: IProfesional;
    public listaPrestaciones: IPrestacionPaciente[] = [];
    public alerta = false;
    public agendas: any = [];
    public fechaActual = new Date();
    public bloqueSeleccionado: any;
    public turnosPrestacion: any = [];
    public breadcrumbs: any;
    public mostrarLista = true;
    public mostrarPacientesSearch = true;

    public conjuntoDePrestaciones: any = [];
    public pacientesPresentes: any = [];
    public pacientesPresentesCompleto: any = [];
    public todasLasPrestaciones: any = [];
    public fechaDesde: Date;
    public fechaHasta: Date;
    public prestacionSeleccion: any;
    public estadoSeleccion: any;
    public selectPrestacionesProfesional: any = [];
    public searchPaciente: any;
    public filtrosPacientes = true;

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioProblemasPaciente: ProblemaPacienteService,
        public servicioAgenda: AgendaService, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        private plex: Plex) { }

    ngOnInit() {
        this.breadcrumbs = this.route.routeConfig.path;
        console.log('pantalla:', this.breadcrumbs);

        let hoy = {
            fechaDesde: moment().startOf('day').format(),
            fechaHasta: moment().endOf('day').format()
        }

        this.fechaDesde = new Date(hoy.fechaDesde);
        this.fechaHasta = new Date(hoy.fechaHasta);
        this.loadAgendasXDia(hoy);

    }

    loadAgendasXDia(params) {
        if (this.auth.profesional) {

            this.servicioAgenda.get(params).subscribe(
                agendas => {
                    this.agendas = agendas;
                    this.CreaConjuntoPrestacionesProfesional();
                    this.TraetodasLasPrestacionesFiltradas(params);
                    this.pacientesPresentes = [];
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

    onPacienteSelected(paciente: IPaciente): void {
        this.paciente = paciente;
        this.mostrarPacientesSearch = false;
        this.mostrarLista = false;
        // this.mostrarPrestacionSelect = true;
    }

    volverAlInicio() {
        this.paciente = null;
        this.mostrarPacientesSearch = true;
        this.mostrarLista = true;
    }

    listadoTurnos(bloque) {
        this.bloqueSeleccionado = bloque;
        let turnos = this.bloqueSeleccionado.turnos.map(elem => { return elem.id; });
        this.servicioPrestacion.get({ turnos: turnos }).subscribe(resultado => {
            this.listaPrestaciones = resultado;
            this.listaPrestaciones.forEach(prestacion => {
                this.turnosPrestacion[prestacion.id.toString()] = this.bloqueSeleccionado.turnos.find(t => {
                    return t.id === prestacion.solicitud.idTurno;
                });
            });
        });
    }


    TraetodasLasPrestacionesFiltradas(params) {

        let fechaDesde = this.fechaActual.setHours(0, 0, 0, 0);
        let fechaHasta = this.fechaActual.setHours(23, 59, 0, 0);

        this.servicioPrestacion.get({
            turneables: true,
            fechaDesde: params.fechaDesde || fechaDesde,
            fechaHasta: params.fechaHasta || fechaHasta,
            // idProfesional: this.auth.profesional.id,
            // idTipoPrestacion: this.conjuntoDePrestaciones[0]//Recorrer y hacer las consultas
        }).subscribe(resultado => {
            if (resultado) {
                this.todasLasPrestaciones = resultado;
            }
            this.cargaPacientes();
        });
    }


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
            turnos.forEach(turno => { // Falta ver en ejecucion y validad
                unPacientePresente.idAgenda = agenda.id;
                unPacientePresente.turno = turno;
                unPacientePresente.tipoPrestacion = turno.tipoPrestacion;
                unPacientePresente.estado = 'En espera';
                unPacientePresente.fecha = turno.horaInicio;

                if (turno.asistencia === 'asistio') {
                    unPacientePresente.estado = 'Presente';
                } else {
                    if (turno.estado === 'suspendido') {
                        unPacientePresente.estado = 'Suspendido';
                        unPacientePresente.fecha = turno.horaInicio;
                    }
                }

                //Buscar si existe una prestacion asociada al turno
                let prestacionTurno = this.todasLasPrestaciones.find(x => {
                    if (x.solicitud.idTurno && (x.solicitud.idTurno.toString() === turno._id.toString())) {

                        return x;
                    }
                });
                // alert(prestacionTurno);
                if (prestacionTurno) {
                    unPacientePresente.idPrestacion = prestacionTurno.id;
                    if (prestacionTurno.estado[(prestacionTurno.estado.length - 1)].tipo !== 'pendiente') {
                        unPacientePresente.estado = prestacionTurno.estado[prestacionTurno.estado.length - 1].tipo;
                        unPacientePresente.fecha = prestacionTurno.estado[prestacionTurno.estado.length - 1].timestamp;
                    }
                }

                // Cargo un objeto con el profesional.
                unPacientePresente.profesionales = agenda.profesionales[0]; // Recorrer los profesionales si los tuviera
                // Cargo el tipo de prestacion
                unPacientePresente.nombrePrestacion = agenda.tipoPrestaciones[0].nombre; // Recorrer las prestaciones si tiene mas de una
                // Recorro agenda saco el estados
                unPacientePresente.paciente = turno.paciente;
                this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
                unPacientePresente = {};
            });
        });

        //Buscamos los que solo tienen prestacion y no tienen turno
        this.todasLasPrestaciones.forEach(prestacion => {
            if (prestacion.solicitud.idTurno === null) {
                unPacientePresente.idAgenda = null;
                unPacientePresente.turno = null;
                unPacientePresente.estado = prestacion.estado[prestacion.estado.length - 1].tipo;
                unPacientePresente.fecha = prestacion.estado[prestacion.estado.length - 1].timestamp;
                if (unPacientePresente.estado === 'pendiente') {
                    unPacientePresente.estado = 'En espera';
                }

                unPacientePresente.idPrestacion = prestacion.id;
                // //cargo un objeto con el profesional.
                unPacientePresente.profesionales = {}; // Recorrer los profesionales si los tuviera
                // //Cargo el tipo de prestacion
                unPacientePresente.nombrePrestacion = prestacion.solicitud.tipoPrestacion.nombre; // Recorrer las prestaciones si tiene mas de una
                // //Recorro agenda saco el estados
                unPacientePresente.paciente = prestacion.paciente;
                this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
                unPacientePresente = {};
            }
        });

        //Ordenar por fecha y hora
        this.pacientesPresentes = this.pacientesPresentes.sort((a, b) => { return (a.fecha > b.fecha) ? 1 : ((b.fecha > a.fecha) ? -1 : 0); });
        this.pacientesPresentesCompleto = [... this.pacientesPresentes];
    }

    // Creo el conjunto de prestaciones del profesional..
    CreaConjuntoPrestacionesProfesional() {
        this.agendas.forEach(element => {
            let agregar = true;

            // Recorro para no agregar dos veces la misma
            for (let i in this.conjuntoDePrestaciones) {
                if (this.conjuntoDePrestaciones[i] === element.tipoPrestaciones[0].id) {
                    agregar = false;
                }
            }
            if (agregar) {
                this.conjuntoDePrestaciones.push(element.tipoPrestaciones[0].id);
                this.selectPrestacionesProfesional = [... this.selectPrestacionesProfesional, {
                    id: element.tipoPrestaciones[0].id,
                    nombre: element.tipoPrestaciones[0].nombre
                }];
            }
        });

    }



    // Va a cargar todos lo pacientes con un turnos pendientes.
    PacientesPendientes() {

    }

    elegirPrestacion(unPacientePresente) {
        debugger;
        if (unPacientePresente.idPrestacion) {
            this.router.navigate(['/rup/resumen', unPacientePresente.idPrestacion]);
        } else {
            if (unPacientePresente.estado != 'Suspendido') {
                //Marcar el turno como presente
                let patch: any = {
                    op: 'darAsistencia',
                    turnos: [unPacientePresente.turno]
                };

                // Patchea los turnosSeleccionados (1 o más turnos)
                this.servicioAgenda.patchMultiple(unPacientePresente.idAgenda, patch).subscribe(resultado => {
                    if (resultado) {
                        //TODO: Ver si se muestra un mensaje
                    }
                });

                // Guardar Prestación Paciente
                let nuevaPrestacion;
                nuevaPrestacion = {
                    paciente: unPacientePresente.paciente,
                    solicitud: {
                        tipoPrestacion: unPacientePresente.tipoPrestacion,
                        fecha: new Date(),
                        listaProblemas: [],
                        idTurno: unPacientePresente.turno.id ? unPacientePresente.turno.id : null,
                    },
                    estado: {
                        timestamp: new Date(),
                        tipo: 'pendiente'
                    },
                    ejecucion: {
                        fecha: new Date(),
                        evoluciones: []
                    }
                };

                this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                    if (prestacion) {
                        this.router.navigate(['/rup/resumen', prestacion.id]);
                    } else {
                        this.plex.alert('ERROR: no se pudo cargar la prestación');
                    }
                });
            }
            // ruteamos
        }
    }

    onReturn() {
        this.router.navigate(['/rup']);
    }

    loadPrestacionesProfesional($event) {
        return $event.callback(this.selectPrestacionesProfesional);
    }
    loadEstados($event) {
        return $event.callback([{ id: 'Presente', nombre: 'Presente' }, { id: 'En espera', nombre: 'En espera' }, { id: 'ejecucion', nombre: 'En ejecución' }, { id: 'validada', nombre: 'Validada' }, { id: 'Suspendido', nombre: 'Suspendido' }]);
    }


    soloPacientesProfesional() { // Filtra los pacientes del profesional
        this.filtrosPacientes = true;
        this.pacientesPresentes = this.pacientesPresentesCompleto.filter(paciente => {
            if (paciente.profesionales.id === this.auth.profesional.id) {
                return paciente;
            }
        });
    }


    todosLosPacientes() { // Trae todos los pacientes
        this.filtrosPacientes = false;
        this.pacientesPresentes = [... this.pacientesPresentesCompleto];
    }


    filtraPorEstado() {
        this.cargaPacientes();
        let misPacientesEstado: any = [];
        if (this.estadoSeleccion) {
            this.pacientesPresentes = this.pacientesPresentesCompleto.filter(paciente => {
                if (paciente.estado === this.estadoSeleccion.id) {
                    return paciente;
                }
            });
        }
    }

    filtraPorPrestacion() {
        let misPacientesPrestacion: any = [];
        if (this.prestacionSeleccion) {
            this.pacientesPresentes = this.pacientesPresentesCompleto.filter(paciente => {
                if (paciente.nombrePrestacion === this.prestacionSeleccion.nombre) {
                    return paciente;
                }
            });
        }
    }

    filtrarPorFecha() {
        this.todasLasPrestaciones = [];
        // this.pacientesPresentes = [];
        let fechaDesde = moment(this.fechaDesde).startOf('day');
        let fechaHasta = moment(this.fechaHasta).endOf('day');

        if (fechaDesde.isValid() && fechaHasta.isValid()) {
            let params = {
                fechaDesde: fechaDesde.format(),
                fechaHasta: fechaHasta.format(),
                idProfesional: this.auth.profesional.id,
                organizacion: this.auth.organizacion.id
            };
            this.loadAgendasXDia(params);
        } else {
            // Demos tiempo para que seleccionen una fecha válida, claro papá
            return;
        }
    }

    crearPrestacionVacia(tipoPrestacion) {

        let nuevaPrestacion;

        tipoPrestacion['turneable'] = true;
        nuevaPrestacion = {
            paciente: this.paciente,
            solicitud: {
                tipoPrestacion: tipoPrestacion,
                fecha: new Date(),
                listaProblemas: [],
                idTurno: null,
            },
            estado: {
                timestamp: new Date(),
                tipo: 'pendiente'
            },
            ejecucion: {
                fecha: new Date(),
                evoluciones: [],
                // profesionales:[] falta asignar.. para obtener el nombre ver si va a venir en token
            }
        };

        nuevaPrestacion.paciente['_id'] = this.paciente.id;

        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            this.plex.alert('Prestación creada.').then(() => {
                this.router.navigate(['/rup/resumen', prestacion.id]);
            });
        });
    }

} // export class Punto Inicio Component