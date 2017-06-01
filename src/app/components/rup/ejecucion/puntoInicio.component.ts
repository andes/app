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
    public usuario: IPaciente;
    public listaPrestaciones: IPrestacionPaciente[] = [];
    public prestacionSeleccionada: IPrestacionPaciente = null; // será un IPaciente
    public enEjecucion = false;
    public alerta = false;
    public agendas: any = [];
    public fechaActual = new Date();
    public bloqueSeleccionado: any;
    public turnosPrestacion: any = [];
    public breadcrumbs: any;
    public mostrarLista = true;
    public mostrarPacientesSearch = true;

    public ConjuntoDePrestaciones: any = [];
    public PacientesPresentes: any = [];
    public unPacientePresente: any = {};
    public TodasLasPrestaciones: any = [];
    public fechaDesde: Date;
    public fechaHasta: Date;
    public prestacionSeleccion: any;
    public estadoSeleccion: any;
    public selectPrestacionesProfesional: any = [];
    public searchPaciente: any;
    public filtrosPacientes: boolean = true;

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

        this.loadAgendasXDia(hoy);

    }

    loadAgendasXDia(params) {
        if (this.auth.profesional) {

            // let fechaDesde = this.fechaActual.setHours(0, 0, 0, 0);
            // let fechaHasta = this.fechaActual.setHours(23, 59, 0, 0);
            this.servicioAgenda.get(params).subscribe(
                agendas => {
                    this.agendas = agendas;
                    // console.log(this.agendas[2].bloques[0].turnos);
                    this.CreaConjuntoPrestacionesProfesional();
                    this.TraeTodasLasPrestacionesFiltradas();
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
        this.mostrarLista = false;
        // this.mostrarPrestacionSelect = true;
        this.mostrarPacientesSearch = false;
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


    TraeTodasLasPrestacionesFiltradas() {

        let fechaDesde = this.fechaActual.setHours(0, 0, 0, 0);
        let fechaHasta = this.fechaActual.setHours(23, 59, 0, 0);

        this.servicioPrestacion.get({
            // turneable: true
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta,
            // idProfesional: this.auth.profesional.id,
            // idTipoPrestacion: this.ConjuntoDePrestaciones[0]//Recorrer y hacer las consultas
        }).subscribe(resultado => {
            resultado.forEach(element => {
                //console.log(element);
                this.TodasLasPrestaciones.push(element);
            });
            //console.log(this.TodasLasPrestaciones);
            this.cargaPacientesDelDia();
        });
        // console.log('#$#$$$$$$$$$$$$$$$$$$$$$$$$$$$$#');
        // console.log(this.TodasLasPrestaciones);
    }


    cargaPacientesDelDia() {
        this.PacientesPresentes = [];
        this.agendas.forEach(element => {
            let turnos: any = [];
            // Recorremos los bloques de una agenda para sacar los turnos.
            for (let i in element.bloques) {
                for (let e in element.bloques[i].turnos) {
                    turnos.push(element.bloques[i].turnos[e]);
                }
            }

            turnos.forEach(elemento => { //Falta ver en ejecucion y validad
                if (elemento.estado === 'asignado' && elemento.asistencia === true) {

                    this.unPacientePresente.estado = 'En espera';
                    this.unPacientePresente.fecha = moment().format();

                    this.TodasLasPrestaciones.forEach(prestacion => {
                        if (elemento.id === prestacion.solicitud.idTurno) {
                            this.unPacientePresente.idPrestacion = prestacion.id;
                            console.log(prestacion);
                            prestacion.estado.forEach(estado => {
                                if (estado.tipo != 'pendiente') {
                                    this.unPacientePresente.estado = estado.tipo;
                                    this.unPacientePresente.fecha = estado.timestamp;
                                }
                            });
                        }
                    });
                    //cargo un objeto con el profesional.
                    this.unPacientePresente.profesionales = element.profesionales[0];//Recorrer los profesionales si los tuviera
                    //Cargo el tipo de prestacion
                    this.unPacientePresente.nombrePrestacion = element.tipoPrestaciones[0].nombre;//Recorrer las prestaciones si tiene mas de una
                    //Recorro agenda saco el estados
                    this.unPacientePresente.paciente = elemento.paciente;
                    this.PacientesPresentes.push(this.unPacientePresente);
                    this.unPacientePresente = {};
                }
            });
        });
        //Buscamos los que solo tienen prestacion y no tienen turno

        console.log(this.TodasLasPrestaciones);

        this.TodasLasPrestaciones.forEach(prestacion => {
            // console.log(prestacion.solicitud);
            if (prestacion.solicitud.idTurno == null) {
                // console.log('dentreoo');
                // console.log(prestacion.solicitud.tipoPrestacion);
                // this.unPacientePresente.estado = 'Sin turno';
                // this.unPacientePresente.fecha = moment().format();
                prestacion.estado.forEach(estado => {
                    this.unPacientePresente.estado = estado.tipo;
                    this.unPacientePresente.fecha = estado.timestamp;
                });
                this.unPacientePresente.idPrestacion = prestacion.id;
                // this.unPacientePresente.idPrestacion = prestacion.id;
                // //cargo un objeto con el profesional.
                this.unPacientePresente.profesionales = {};//Recorrer los profesionales si los tuviera
                // //Cargo el tipo de prestacion
                this.unPacientePresente.nombrePrestacion = prestacion.solicitud.tipoPrestacion.nombre;//Recorrer las prestaciones si tiene mas de una
                // //Recorro agenda saco el estados
                this.unPacientePresente.paciente = prestacion.paciente;
                this.PacientesPresentes.push(this.unPacientePresente);
                this.unPacientePresente = {};
            }
        });

    }

    // Creo el conjunto de prestaciones del profesional..
    CreaConjuntoPrestacionesProfesional() {
        this.agendas.forEach(element => {
            let agregar = true;

            // Recorro para no agregar dos veces la misma
            for (let i in this.ConjuntoDePrestaciones) {
                if (this.ConjuntoDePrestaciones[i] === element.tipoPrestaciones[0].id) {
                    agregar = false;
                }
            }
            if (agregar) {
                this.ConjuntoDePrestaciones.push(element.tipoPrestaciones[0].id);
                this.selectPrestacionesProfesional.push({
                    id: element.tipoPrestaciones[0].id,
                    nombre: element.tipoPrestaciones[0].nombre
                });
            }
        });

    }



    //Va a cargar todos lo pacientes con un turnos pendientes.
    PacientesPendientes() {

    }

    elegirPrestacion(id) {
        this.router.navigate(['/rup/resumen', id]);
    }

    onReturn() {
        this.router.navigate(['/rup']);
    }

    loadPrestacionesProfesional($event) {
        return $event.callback(this.selectPrestacionesProfesional);
    }
    loadEstados($event) {
        return $event.callback([{ id: 'En espera', nombre: 'En espera' }, { id: 'ejecucion', nombre: 'En ejecucion' }, { id: 'validada', nombre: 'validada' }]);
    }


    soloPacientesProfesional() { //Filtra los pacientes del profesional
        this.filtrosPacientes = true;
        let misPacientes: any = [];
        // console.log('PacientesPresentes: ', this.PacientesPresentes);
        // console.log('PROFESIONAL: ', this.auth.profesional.id);
        this.PacientesPresentes.forEach(paciente => {

            if (paciente.profesionales.id === this.auth.profesional.id) {
                misPacientes.push(paciente);
            }
        });
        this.PacientesPresentes = misPacientes;
    }


    todosLosPacientes() { //trae todos los pacientes
        this.filtrosPacientes = false;
        this.cargaPacientesDelDia();
    }


    filtraPorEstado() {
        this.cargaPacientesDelDia();
        let misPacientesEstado: any = [];
        if (this.estadoSeleccion) {
            this.PacientesPresentes.forEach(paciente => {
                // console.log(this.estadoSeleccion.id);
                if (paciente.estado == this.estadoSeleccion.id) {
                    misPacientesEstado.push(paciente);
                }
            });
            this.PacientesPresentes = misPacientesEstado;
        }
    }

    filtraPorPrestacion() {
        this.cargaPacientesDelDia();
        let misPacientesPrestacion: any = [];
        if (this.prestacionSeleccion) {
            this.PacientesPresentes.forEach(paciente => {
                if (paciente.nombrePrestacion == this.prestacionSeleccion.nombre) {//Pasarlo a los id
                    misPacientesPrestacion.push(paciente);
                }
                this.PacientesPresentes = misPacientesPrestacion;
            });
        }
    }

    filtrarPorFecha() {
        let fechaDesde = moment(this.fechaDesde).startOf('day');
        let fechaHasta = moment(this.fechaHasta).endOf('month');

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
        console.log(tipoPrestacion);
        console.log('tipoPrestacion');

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