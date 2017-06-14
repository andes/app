import {
    PacienteSearch
} from './../../../services/pacienteSearch.interface';
import {
    TipoPrestacionService
} from './../../../services/tipoPrestacion.service';
import {
    element
} from 'protractor';
import {
    IOrganizacion
} from './../../../interfaces/IOrganizacion';
import {
    OrganizacionComponent
} from './../../organizacion/organizacion.component';
import {
    IProfesional
} from './../../../interfaces/IProfesional';
import {
    Auth
} from '@andes/auth';
import {
    Plex
} from '@andes/plex';
import {
    AgendaService
} from './../../../services/turnos/agenda.service';
import {
    ITipoPrestacion
} from './../../../interfaces/ITipoPrestacion';
import {
    PrestacionPacienteService
} from './../../../services/rup/prestacionPaciente.service';
import {
    IPrestacionPaciente
} from './../../../interfaces/rup/IPrestacionPaciente';
import {
    Component,
    OnInit,
    Output,
    Input,
    EventEmitter,
    HostBinding
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {
    ProblemaPacienteService
} from './../../../services/rup/problemaPaciente.service';
import {
    IPaciente
} from './../../../interfaces/IPaciente';
import {
    IProblemaPaciente
} from './../../../interfaces/rup/IProblemaPaciente';
// Rutas
import {
    Router,
    ActivatedRoute,
    Params
} from '@angular/router';
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
    public pacientesFiltrados: any = [];
    public pacientesPresentesCompleto: any = [];
    public todasLasPrestaciones: any = [];
    public fechaDesde: Date;
    public fechaHasta: Date;
    public prestacionSeleccion: any;
    public estadoSeleccion: any;
    public misPacientesSeleccion = false;
    public todosSeleccion = false;
    public selectPrestacionesProfesional: any = [];

    public searchPaciente: any;
    public filtrosPacientes = true;
    public textoTipeado: string = null;
    public searchTerm: String = '';

    private buscarMPI: boolean = false;

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioProblemasPaciente: ProblemaPacienteService,
        private servicioTipoPrestacion: TipoPrestacionService,
        public servicioAgenda: AgendaService, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        private plex: Plex) { }

    ngOnInit() {
        console.log("obj auth: ", this.auth);
        this.breadcrumbs = this.route.routeConfig.path;

        let hoy = {
            fechaDesde: moment().startOf('day').format(),
            fechaHasta: moment().endOf('day').format()
        }

        this.fechaDesde = new Date(hoy.fechaDesde);
        this.fechaHasta = new Date(hoy.fechaHasta);
        this.loadAgendasXDia(hoy);

    }


    /**
     * @returns Realiza la búsqueda de pacientes localmente y si no existe lo busca en mpi
     * 
     * @memberof PuntoInicioComponent
     */
    buscar() {
        this.cargaPacientes();
        if (this.searchTerm) {
            let search = this.searchTerm.toUpperCase();
            this.pacientesFiltrados = this.pacientesPresentes.filter(paciente => {
                if (paciente.paciente.nombre.indexOf(search) !== -1 || paciente.paciente.apellido.indexOf(search) !== -1 || paciente.paciente.documento.indexOf(search) !== -1) {
                    return paciente;
                }
            });
            this.pacientesPresentes = this.pacientesFiltrados;
            if (this.pacientesPresentes.length <= 0 && this.searchTerm.length > 0) {
                this.buscarMPI = true;
            }
            else {
                this.buscarMPI = false;
            }
        }
    }


    //Reinicia la búsqueda en la tabla de acuerdo al output de componente pacienteSearch
    handleBlanqueo(event) {
        this.buscarMPI = false;
        this.searchTerm = null;
        this.volverAlInicio();
    }

    
    volverAlInicio() {
        this.paciente = null;
        this.mostrarLista = true;
        this.cargaPacientes;
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

    // Creo el conjunto de prestaciones del profesional..
    CreaConjuntoPrestacionesProfesional() {
        //Obtenemos los tipos de prestaciones que tiene autorizadas el usuario
        let tipoPrestacionesAuth = this.auth.getPermissions('rup:tipoPrestacion:?');
        if (tipoPrestacionesAuth && (tipoPrestacionesAuth.length > 0)) {
            this.servicioTipoPrestacion.get({
                'incluir': tipoPrestacionesAuth.join(',')
            }).subscribe(resultado => {
                if (resultado) {
                    this.selectPrestacionesProfesional = resultado;
                    this.conjuntoDePrestaciones = resultado;
                }
                //Agregamos los tipos de prestaciones de las agendas filtradas
                if (this.agendas && this.agendas.length > 0) {
                    this.agendas.forEach(agenda => {
                        let agregar = true;
                        this.conjuntoDePrestaciones = [... this.conjuntoDePrestaciones, ...agenda.tipoPrestaciones];
                        this.conjuntoDePrestaciones = this.conjuntoDePrestaciones.filter(function (elem, pos, arr) {
                            return arr.indexOf(elem) === pos;
                        });

                    });
                    this.selectPrestacionesProfesional = [... this.conjuntoDePrestaciones];
                }
            });
        }

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
                unPacientePresente.estado = 'Programado';
                unPacientePresente.fecha = turno.horaInicio;
                unPacientePresente.profesionales = agenda.profesionales; // Recorrer los profesionales si los tuviera
                // Cargo el tipo de prestacion
                unPacientePresente.nombrePrestacion = turno.tipoPrestacion.nombre; // Recorrer las prestaciones si tiene mas de una
                // Recorro agenda saco el estados
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
                    if (x.solicitud.idTurno && (x.solicitud.idTurno.toString() === turno._id.toString())) {

                        return x;
                    }
                });

                if (prestacionTurno) {
                    unPacientePresente.idPrestacion = prestacionTurno.id;
                    // Cargo un objeto con el profesional.
                    unPacientePresente.profesionales = [prestacionTurno.estado[prestacionTurno.estado.length - 1].profesional];
                    if (prestacionTurno.estado[(prestacionTurno.estado.length - 1)].tipo !== 'pendiente') {
                        unPacientePresente.estado = prestacionTurno.estado[prestacionTurno.estado.length - 1].tipo;
                        unPacientePresente.fecha = prestacionTurno.estado[prestacionTurno.estado.length - 1].timestamp;
                    }
                }

                this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
                unPacientePresente = {};
            });
        });

        //Buscamos los que solo tienen prestacion y no tienen turno
        let prestacionesSinTurno = this.todasLasPrestaciones.filter(prestacion => {
            if (prestacion.solicitud.idTurno === null) {
                return prestacion;
            }
        });

        prestacionesSinTurno.forEach(prestacion => {
            unPacientePresente.idAgenda = null;
            unPacientePresente.turno = null;
            unPacientePresente.estado = prestacion.estado[prestacion.estado.length - 1].tipo;
            unPacientePresente.fecha = prestacion.estado[prestacion.estado.length - 1].timestamp;
            unPacientePresente.profesionales = [prestacion.estado[prestacion.estado.length - 1].profesional];

            if (unPacientePresente.estado === 'pendiente') {
                unPacientePresente.estado = 'Programado';
            }

            unPacientePresente.idPrestacion = prestacion.id;
            // //Cargo el tipo de prestacion
            unPacientePresente.nombrePrestacion = prestacion.solicitud.tipoPrestacion.nombre; // Recorrer las prestaciones si tiene mas de una
            // //Recorro agenda saco el estados
            unPacientePresente.paciente = prestacion.paciente;
            this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
            unPacientePresente = {};
        });
        //Ordenar por fecha y hora
        this.pacientesPresentes = this.pacientesPresentes.sort((a, b) => { return (a.fecha > b.fecha) ? 1 : ((b.fecha > a.fecha) ? -1 : 0); });
        this.pacientesPresentesCompleto = [... this.pacientesPresentes];
        this.filtrarPacientes(this.filtrosPacientes);
    }





    elegirPrestacion(unPacientePresente) {
        if (unPacientePresente.idPrestacion) {
            this.router.navigate(['/rup/resumen', unPacientePresente.idPrestacion]);
        } else {
            if (unPacientePresente.estado !== 'Suspendido') {
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

                // Si aún no existe la prestación creada vamos a generarla
                let nuevaPrestacion;
                nuevaPrestacion = {
                    paciente: unPacientePresente.paciente,
                    solicitud: {
                        tipoPrestacion: unPacientePresente.tipoPrestacion,
                        fecha: new Date(),
                        listaProblemas: [],
                        idTurno: unPacientePresente.turno.id ? unPacientePresente.turno.id : null,
                        // profesional logueado
                        profesional:
                        {
                            id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                            apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                        },
                        // organizacion desde la que se solicita la prestacion
                        organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.id.nombre },
                    },
                    estado: {
                        timestamp: new Date(),
                        tipo: 'pendiente',
                        profesional:
                        {
                            id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                            apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                        }
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

    onPacienteSelected(paciente: IPaciente): void {
        this.paciente = paciente;
        this.mostrarPacientesSearch = false;
        this.mostrarLista = false;
        // this.mostrarPrestacionSelect = true;
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
                // profesional logueado
                profesional:
                {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.id.nombre },
            },
            estado: {
                timestamp: new Date(),
                tipo: 'pendiente',
                profesional:
                {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                }
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

    onReturn() {
        this.router.navigate(['/rup']);
    }

    loadPrestacionesProfesional($event) {
        return $event.callback(this.selectPrestacionesProfesional);
    }
    loadEstados($event) {
        return $event.callback([{ id: 'Programado', nombre: 'Programado' }, { id: 'En espera', nombre: 'En espera' }, { id: 'ejecucion', nombre: 'En ejecución' }, { id: 'validada', nombre: 'Validada' }, { id: 'Suspendido', nombre: 'Suspendido' }]);
    }

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
            // Demos tiempo para que seleccionen una fecha válida, claro papá
            return;
        }
    }

    filtrarPacientes(misPacientes: boolean) {
        this.filtrosPacientes = misPacientes;
        let listadoFiltrado = [... this.pacientesPresentesCompleto];

        if (this.filtrosPacientes) {
            listadoFiltrado = listadoFiltrado.filter(paciente => {
                if (paciente.profesionales.length > 0) {
                    if (paciente.profesionales.find(p => p.id == this.auth.profesional.id)) {
                        return paciente;
                    }
                }
            });
        }

        if (this.prestacionSeleccion) {
            listadoFiltrado = listadoFiltrado.filter(paciente => {
                if (paciente.nombrePrestacion === this.prestacionSeleccion.nombre) {
                    return paciente;
                }
            });
        }

        if (this.estadoSeleccion) {
            listadoFiltrado = listadoFiltrado.filter(paciente => {
                if (paciente.estado === this.estadoSeleccion.id) {
                    return paciente;
                }
            });
        }

        this.pacientesPresentes = [...listadoFiltrado];

    }

} // export class Punto Inicio Component


