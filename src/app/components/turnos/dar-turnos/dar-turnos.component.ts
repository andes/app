import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, switchMap } from 'rxjs';
import { CarpetaPacienteService } from 'src/app/core/mpi/services/carpeta-paciente.service';
import { ITipoPrestacion } from 'src/app/interfaces/ITipoPrestacion';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { ReglaService } from 'src/app/services/top/reglas.service';
import { IPaciente, IPacienteBasico } from '../../../core/mpi/interfaces/IPaciente';
// Servicios
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { IObraSocial } from '../../../interfaces/IObraSocial';
import { ObraSocialCacheService } from '../../../services/obraSocialCache.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
import { idCMI } from '../constantes';
import { environment } from './../../../../environments/environment';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
// Interfaces
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { IListaEspera } from './../../../interfaces/turnos/IListaEspera';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { ObraSocialService } from './../../../services/obraSocial.service';
import { SmsService } from './../../../services/turnos/sms.service';
import { TurnoService } from './../../../services/turnos/turno.service';
import { EstadosAgenda } from './../enums';
import { CalendarioDia } from './calendario-dia.class';
import { EstadosDarTurnos } from './enums';



@Component({
    selector: 'dar-turnos',
    templateUrl: 'dar-turnos.html',
    styleUrls: [
        'dar-turnos.scss'
    ]
})

export class DarTurnosComponent implements OnInit {
    pacienteFields = ['financiador', 'numeroAfiliado', 'telefono'];
    nroCarpetaOriginal: string;
    public lenNota = 140;
    public nota = '';
    public link: String = '';
    public changeCarpeta = false;
    hideDarTurno: boolean;
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    autocitado = false;
    puedeDarSobreturno;

    tipoPrestacionesPermitidas: ITipoPrestacion[];

    @Input('pacienteSeleccionado')
    set pacienteSeleccionado(value: any) {
        this._pacienteSeleccionado = value;
        this.actualizarDatosPaciente(this._pacienteSeleccionado.id);
    }
    get pacienteSeleccionado() {
        return this._pacienteSeleccionado;
    }

    private tipoTurno = 'programado';

    @Input('solicitudPrestacion')
    set solicitudPrestacion(value: any) {
        this._solicitudPrestacion = value;
        if (this._solicitudPrestacion) {
            this.autocitado = this._solicitudPrestacion.solicitud && this._solicitudPrestacion.solicitud.registros &&
                this._solicitudPrestacion.solicitud.registros[0].valor && this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion &&
                this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado;
            this.motivoConsulta = this._solicitudPrestacion.solicitud && this._solicitudPrestacion.solicitud.registros &&
                this._solicitudPrestacion.solicitud.registros[0].valor && this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion &&
                this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.motivo ? this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.motivo : this.motivoConsulta;
            this.turnoTipoPrestacion = this._solicitudPrestacion.solicitud.tipoPrestacion;
            this.actualizarDatosPaciente(this._solicitudPrestacion.paciente.id);
            this.tipoTurno = this._solicitudPrestacion.inicio === 'servicio-intermedio' ? 'programado' : 'gestion';

            if (this.tipoTurno === 'programado') {
                const reglaId = this._solicitudPrestacion.solicitud.reglaId;
                if (reglaId) {
                    this.reglasService.getById(reglaId).subscribe((regla) => {
                        this.tipoPrestacionesPermitidas = regla.destino.agendas;
                        if (this.tipoPrestacionesPermitidas?.length) {
                            this.opciones.tipoPrestacion = this.tipoPrestacionesPermitidas[0];
                            this.actualizar();
                        }
                    });
                }
            }

        } else {
            this.tipoTurno = 'programado';
        }
    }
    get solicitudPrestacion() {
        return this._solicitudPrestacion;
    }

    @Input('solicitudVacunacion')
    set solicitudVacunacion(value: any) {
        this._solicitudVacunacion = value;
        this.organizacion = value.organizacion;
    }
    get solicitudVacunacion() {
        return this._solicitudVacunacion;
    }

    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();
    @Output() afterDarTurno: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAlGestor = new EventEmitter<any>();
    // usamos este output para volver al componente de validacion de rup
    @Output() volverValidacion = new EventEmitter<any>();

    private _solicitudVacunacion;
    public organizacion = this.auth.organizacion;
    public _pacienteSeleccionado: any;
    public _solicitudPrestacion: any; // TODO: cambiar por IPrestacion cuando esté
    public paciente: IPaciente;
    public opciones: any = {};
    public agenda: IAgenda;
    public agendas: IAgenda[];
    public estadosAgenda = EstadosAgenda;
    public estadoFacturacion: any = {
        tipo: '',
        estado: 'Sin comprobante',
        numeroComprobante: ''
    };
    public prestacionSeleccionada: any = null; // filtro por prestacion en calendario
    public profesionalSeleccionado: any = null; // filtro por profesional en calendario
    public agendasDelDia = [];
    public showSobreturno = false;

    estadoT: EstadosDarTurnos;
    turnoDoble = false;
    turnoTelefonico = false;
    desplegarOS = false; // Indica si es se requiere seleccionar OS y numero de Afiliado
    numeroAfiliado;
    telefono = '';
    countBloques: any[];
    countTurnos: any = {};
    resultado: any;
    seleccion = null;
    esEscaneado = false;
    ultimosTurnos: any[];
    indice = -1;
    semana: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    permisos = [];
    autorizado = false;
    pacientesSearch = true;
    showDarTurnos = false;
    cambioTelefono = false;
    showCreateUpdate = false;
    tiposTurnosSelect: string;
    tiposTurnosLabel: string;
    hoy: Date;
    bloque: IBloque;
    delDiaDisponibles: number;
    turno: any;
    programadosDisponibles: number;
    gestionDisponibles: number;
    profesionalDisponibles: number;
    turnoTipoPrestacion: any;
    alternativas: any[] = [];
    reqfiltros = false;
    permitirTurnoDoble = false;
    carpetaEfector: any;
    obraSocialPaciente: IObraSocial;
    motivoConsulta: string;
    showTab = 0;
    equipoSalud;
    prestacionesAlternativa;

    // Muestra sólo las agendas a las que se puede asignar el turno (oculta las "con/sin alternativa")
    mostrarNoDisponibles = false;
    // Muestra/Oculta los días de fin de semana (sábado y domingo)
    mostrarFinesDeSemana = true;

    private bloques: IBloque[];
    private indiceTurno: number;
    private indiceBloque: number;
    private cacheBusquedas: any[] = localStorage.getItem('busquedas') ? JSON.parse(localStorage.getItem('busquedas')) : [];
    private busquedas = [...this.cacheBusquedas];
    private eventoProfesional: any = null;
    public mostrarCalendario = false;
    public condicionLlaveAgenda: any;

    constructor(
        public serviceProfesional: ProfesionalService,
        public serviceAgenda: AgendaService,
        public serviceListaEspera: ListaEsperaService,
        public serviceTurno: TurnoService,
        public servicePaciente: PacienteService,
        public servicioCarpetaPaciente: CarpetaPacienteService,
        public conceptosTurneablesService: ConceptosTurneablesService,
        public servicioPrestacionPaciente: PrestacionesService,
        public servicioOS: ObraSocialService,
        public smsService: SmsService,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private osService: ObraSocialCacheService,
        private reglasService: ReglaService
    ) { }

    ngOnInit() {
        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.puedeDarSobreturno = this.auth.check('turnos:puntoInicio:darSobreturno');
        this.opciones.fecha = moment().toDate();

        this.carpetaEfector = {
            organizacion: {
                _id: this.organizacion.id,
                nombre: this.organizacion.nombre
            },
            nroCarpeta: ''
        };
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');

        if (this._pacienteSeleccionado) {
            this.pacientesSearch = false;
            this.showDarTurnos = true;
        }

        // Filtra las búsquedas en localStorage para que muestre sólo las del usuario y organización donde se encuentra logueado
        if (this.busquedas.length > 0) {
            this.busquedas = this.busquedas.filter(busqueda => {
                return busqueda.organizacion;
            });
            this.busquedas = this.busquedas.filter(busqueda => {
                return busqueda.usuario && busqueda.usuario.documento === this.auth.usuario.documento && busqueda.organizacion.id === this.organizacion.id;
            });
            this.busquedas = this.busquedas.slice(0, 5);
        }
        this.desplegarOS = this.desplegarObraSocial();
        // Si es solicitud con profesional asignado, lo carga por defecto la primera vez
        this.opciones.profesional = this._solicitudPrestacion?.solicitud?.profesional ? this._solicitudPrestacion.solicitud.profesional : this.opciones.profesional;
        this.actualizar();
    }

    actualizarDatosPaciente(idPaciente) {
        this.servicePaciente.getById(idPaciente).subscribe(
            pacienteMPI => {
                this.paciente = pacienteMPI;
                this.verificarTelefono(pacienteMPI);
                this.obtenerCarpetaPaciente();
                if (this.paciente.documento) {
                    this.osService.getFinanciadorPacienteCache().subscribe((financiador) => {
                        this.obraSocialPaciente = financiador;
                        this.desplegarOS = this.desplegarObraSocial();
                    });
                }
            });
    }

    loadTipoPrestaciones(event) {
        this.conceptosTurneablesService.getAll().subscribe((data) => {
            let dataF;
            if (this.permisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => {
                    return this.permisos.indexOf(x.id) >= 0;
                });
            }
            event.callback(dataF);
            if (this._solicitudPrestacion) {
                this.actualizar();
            }
        });
    }

    // Funcion que devuelve el indice correspondiente a un bloque dentro del array "this.agenda.bloques".
    findIndex(bloque: IBloque): Number {
        return this.agenda.bloques.findIndex(b => b.id === bloque.id);
    }

    habilitarTurnoDoble() {
        // Si el siguiente turno está disponible, se habilita la opción de turno doble
        let cantidadTurnos;
        this.permitirTurnoDoble = false;
        const tipoTurnoDoble = this.tiposTurnosSelect.toString();
        const cantidadDisponible = this.countBloques[this.indiceBloque];
        if (cantidadDisponible) {
            if (this.agenda.bloques[this.indiceBloque].cantidadTurnos) {
                cantidadTurnos = this.agenda.bloques[this.indiceBloque].cantidadTurnos;
                cantidadTurnos--;
                if (this.indiceTurno < cantidadTurnos && (cantidadDisponible[tipoTurnoDoble] >= 2)) {
                    // se verifica el estado del siguiente turno, si está disponible se permite la opción de turno doble
                    if (this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno + 1].estado === 'disponible') {
                        this.permitirTurnoDoble = true;
                        if (this.agenda.bloques[this.indiceBloque].citarPorBloque) {
                            if (String(this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].horaInicio) !== String(this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno + 1].horaInicio)) {
                                this.permitirTurnoDoble = false;
                            }
                        }
                    }
                }
            }
        }
    }

    loadProfesionales(event) {
        if (this._solicitudPrestacion && this._solicitudPrestacion.solicitud && this._solicitudPrestacion.solicitud.profesional) {
            event.callback([this._solicitudPrestacion.solicitud.profesional]);
        }
        if (event.query) {
            const query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            if (this.opciones && this.opciones.profesional) {
                event.callback([this.opciones.profesional]);
            } else {
                event.callback([]);
            }
        }
        this.eventoProfesional = event;
    }

    loadObrasSociales(event) {
        if (event.query) {
            const query = { nombre: event.query, prepaga: true };
            this.servicioOS.getListado(query).subscribe(
                resultado => {
                    resultado = resultado.map(os => {
                        os.id = os._id;
                        return os;
                    });
                    event.callback(resultado);
                }
            );
        } else {
            this.servicioOS.getListado({ prepaga: true }).subscribe(
                resultado => {
                    event.callback(resultado);
                }
            );
        }
    }

    filtrar() {
        this.prestacionSeleccionada = this.opciones.tipoPrestacion;
        this.profesionalSeleccionado = this.opciones.profesional;

        const search = {
            'tipoPrestacion': this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion : null,
            'profesional': this.opciones.profesional ? this.opciones.profesional : null,
            'usuario': this.auth.usuario,
            'organizacion': this.organizacion || this.auth.organizacion
        };

        if (this.cacheBusquedas.length >= 100) {
            this.cacheBusquedas.pop(); // Limitamos a una cache global a las últimas 100 búsquedas globales en todos los efectores
        }

        if (search.tipoPrestacion || search.profesional) {
            const index = this.cacheBusquedas.findIndex(
                item => (item.profesional?._id === search.profesional?._id) &&
                    (item.tipoPrestacion?._id === search.tipoPrestacion?._id) &&
                    (item.organizacion?.id === search.organizacion?.id)
            );

            if (index > 0) {
                this.cacheBusquedas.splice(index, 1);
                this.busquedas = JSON.parse(JSON.stringify(this.cacheBusquedas));
            }

            if (index !== 0) {
                this.busquedas.splice(0, 0, search);
                this.cacheBusquedas.splice(0, 0, search);
            }

            if (this.busquedas.length > 5) {
                this.busquedas = this.busquedas.slice(0, 5);
            }
            localStorage.setItem('busquedas', JSON.stringify(this.cacheBusquedas));
        }
        if (!this.solicitudPrestacion) {
            const regla: any = {
                paciente: this.pacienteSeleccionado.id
            };
            if (this.prestacionSeleccionada && this.prestacionSeleccionada.conceptId) {
                regla.prestacion = this.prestacionSeleccionada.conceptId;
            }
            this.serviceTurno.getRules(regla).subscribe(resp => {
                this.condicionLlaveAgenda = resp.length > 0 || false;
                this.actualizar();
            });
        } else {
            this.actualizar();
        }
    }

    actualizar() {
        if (this._solicitudPrestacion && !this.tipoPrestacionesPermitidas) {
            this.opciones.tipoPrestacion = this._solicitudPrestacion.solicitud.tipoPrestacion;
        }
        if (this.solicitudVacunacion) {
            this.opciones.tipoPrestacion = this.solicitudVacunacion.tipoPrestacion;
        }
        // 1) Auth general (si puede ver esta pantalla)
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

        // 2) Permisos
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');

        let params: any = {};
        this.estadoT = 'noSeleccionada';
        this.agendas = [];
        this.agenda = null;

        const fechaHasta = (moment(this.opciones.fecha).endOf('month')).toDate();

        // Filtro búsqueda
        if (this.opciones.tipoPrestacion || this.opciones.profesional) {
            this.mostrarCalendario = true;
            // Agendas a partir de hoy aplicando filtros seleccionados y permisos
            params = {
                rango: true, desde: new Date(), hasta: fechaHasta,
                tipoPrestacion: (this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.conceptId : ''),
                organizacion: this.organizacion.id,
                nominalizada: true
            };

            if (this.opciones.profesional) {
                params['idProfesional'] = this.opciones.profesional.id;
            }

            if (!this.opciones.tipoPrestacion) {
                params['tipoPrestaciones'] = (this.permisos[0] === '*') ? [] : this.permisos;

            }
            // Traer las agendas
            this.serviceAgenda.get(params).subscribe(agendas => {
                // Filtrar agendas disponibles o publicadas
                this.agendas = agendas.filter(data => {
                    if (data.turnosRestantesGestion > 0 && !(this.tipoTurno === 'gestion')) {
                        data.condicionLlave = this.condicionLlaveAgenda;
                    }
                    if (data.horaInicio >= moment(new Date()).startOf('day').toDate() && data.horaInicio <= moment(new Date()).endOf('day').toDate()) {
                        if (this.tipoTurno === 'gestion' && this.contieneExclusivoGestion(data)) {
                            return (data.estado === 'disponible' || data.estado === 'publicada');
                        } else {
                            return (data.estado === 'publicada');
                        }
                    } else {
                        if (this.tipoTurno === 'gestion' || data.condicionLlave) {
                            return (data.estado === 'disponible' || data.estado === 'publicada');
                        } else {
                            return (data.estado === 'publicada');
                        }
                    }
                });

                // Por defecto no se muestran las agendas que no tienen turnos disponibles
                if (!this.mostrarNoDisponibles) {
                    this.agendas = this.agendas.filter(agenda => {
                        const delDia = agenda.horaInicio >= moment().startOf('day').toDate() && agenda.horaInicio <= moment().endOf('day').toDate();
                        // por estados
                        const publicada = agenda.estado === 'publicada';
                        const disponible = agenda.estado === 'disponible';
                        const esGestion = this.tipoTurno === 'gestion';
                        // por tipo
                        const dinamicaDelDiaConCupoDisponible = agenda.dinamica && delDia && ((agenda as any).cupo > 0 || agenda.cupo === -1) && !esGestion;
                        const delDiaConTurnosDisponibles = (agenda.turnosRestantesDelDia + agenda.turnosRestantesProgramados) > 0 && delDia;
                        const programadaConTurnosDisponibles = agenda.turnosRestantesProgramados > 0 && !delDia;
                        const autocitadoConTurnosDisponibles = this.autocitado && agenda.turnosRestantesProfesional > 0;
                        const llaveConTurnosDisponibles = !this.autocitado && agenda.turnosRestantesGestion > 0;
                        // condiciones
                        const accesoDirectoConTurnosDisponibles = !esGestion && ((delDiaConTurnosDisponibles && this.hayTurnosEnHorario(agenda)) || programadaConTurnosDisponibles);
                        const gestionConTurnosDisponibles = esGestion && (autocitadoConTurnosDisponibles || llaveConTurnosDisponibles);

                        const cond = (publicada && accesoDirectoConTurnosDisponibles) ||
                            ((publicada || disponible) && (gestionConTurnosDisponibles || dinamicaDelDiaConCupoDisponible || agenda.condicionLlave));
                        return cond;
                    });
                }

                // Ordena las Agendas por fecha/hora de inicio
                this.agendas = this.agendas.sort((a, b) => {
                    const inia = moment(a.horaInicio);
                    const inib = moment(b.horaInicio);
                    return (
                        ((inia.isSame(inib, 'day') ? null : (inia.isBefore(inib, 'day') ? -1 : 1)) || b.turnosDisponibles - a.turnosDisponibles));

                });

            });
        } else {
            this.mostrarCalendario = false;
        }
    }

    // retorna true si algun bloque de la agenda es exclusivo de gestión
    contieneExclusivoGestion(agenda: IAgenda): boolean {
        return agenda.bloques.some(bloque =>
            bloque.reservadoGestion > 0 &&
            bloque.accesoDirectoDelDia === 0 &&
            bloque.accesoDirectoProgramado === 0 &&
            bloque.reservadoProfesional === 0);
    }

    hayTurnosEnHorario(agenda) {
        const ultimahora = moment(agenda.horaFin).format();
        const horaLimite = (moment(new Date()).format());
        const resolucion = (ultimahora > horaLimite);
        return resolucion;
    }

    hayTurnosDisponibles(agenda) {
        return agenda.bloques.filter(bloque => {
            return bloque.filter(turno => {
                return turno.estado === 'disponible';
            });
        }).length > 0;
    }

    isActive(turno) {
        return (turno === this.turno);
    }

    /**
     * Selecciona una Agenda (click en el calendario). Pueden haber mas de una en el mismo dia.
     */
    seleccionarAgenda(agendasDelDia) {
        this.agendasDelDia = agendasDelDia;
        // Asigno agenda
        if (this.indice > -1 && this.indice < agendasDelDia.length) {
            this.agenda = agendasDelDia[this.indice];
            this.bloque = null;
            this.turno = null;
        } else {
            this.indice = 0;
            this.agenda = agendasDelDia[0];
        }
        const esAgendaDeHoy = this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate();
        let turnoAnterior = null;
        this.showSobreturno = false;
        this.turnoDoble = false;
        // Ver si cambió el estado de la agenda en otro lado
        this.serviceAgenda.getById(this.agenda.id).subscribe(agendaSeleccionada => {
            // Si cambió el estado y ya no está disponible ni publicada, mostrar un alerta y cancelar cualquier operación
            if (agendaSeleccionada.estado !== 'disponible' && agendaSeleccionada.estado !== 'publicada') {
                this.plex.info('warning', 'Esta agenda ya no está disponible.');
                return false;
            } else {

                this.alternativas = [];
                // Se filtran los bloques segun el filtro tipoPrestacion

                this.filtrarBloques(esAgendaDeHoy);

                if (this.agenda) {
                    this.link = this.agenda.link;
                    const idAgendas = this.agendasDelDia.map(elem => {
                        return elem.id;
                    });

                    this.indice = idAgendas.indexOf(this.agenda.id);

                    // Usamos CalendarioDia para hacer chequeos
                    const cal = new CalendarioDia(null, this.agendasDelDia, this._solicitudPrestacion, this.tipoTurno);

                    /* Si hay turnos disponibles para la agenda, se muestra en el panel derecho*/
                    if (cal.estado !== 'ocupado') {
                        if (this.agenda.dinamica) {
                            this.estadoT = 'dinamica';
                        } else {
                            // Tiene solicitud
                            if (this.tipoTurno === 'gestion' || this.agenda.condicionLlave) {
                                if (this.autocitado) {
                                    this.tiposTurnosSelect = 'profesional';
                                } else {
                                    this.tiposTurnosSelect = 'gestion';
                                }
                            } else {
                                if (this.agenda.estado === 'publicada') {
                                    this.tiposTurnosSelect = 'programado';
                                }
                            }

                            const countBloques = [];
                            this.delDiaDisponibles = 0;
                            this.programadosDisponibles = 0;
                            this.gestionDisponibles = 0;
                            this.profesionalDisponibles = 0;

                            this.agenda.bloques.forEach((bloque, indexBloque) => {
                                countBloques.push({
                                    // Si la agenda es de hoy los programados se suman a los del día
                                    delDia: esAgendaDeHoy ? (bloque.restantesDelDia as number) + (bloque.restantesProgramados as number) : bloque.restantesDelDia,
                                    programado: esAgendaDeHoy ? 0 : bloque.restantesProgramados,
                                    gestion: bloque.restantesGestion,
                                    profesional: bloque.restantesProfesional
                                });
                                bloque.turnos.forEach((turno) => {
                                    if (turno.estado === 'turnoDoble' && turnoAnterior) {
                                        turno = turnoAnterior;
                                    }
                                    turnoAnterior = turno;
                                });

                                // Acumulado de todos los bloques clasificado x tipo de turno
                                this.delDiaDisponibles += countBloques[indexBloque].delDia;
                                this.programadosDisponibles += countBloques[indexBloque].programado;
                                this.gestionDisponibles += countBloques[indexBloque].gestion;
                                this.profesionalDisponibles += countBloques[indexBloque].profesional;
                            });

                            if (esAgendaDeHoy) {
                                if (this.tipoTurno === 'gestion' && this.contieneExclusivoGestion(this.agenda)) {
                                    this.tiposTurnosSelect = 'gestion';
                                    this.estadoT = 'seleccionada';
                                } else {
                                    this.tiposTurnosSelect = 'delDia';
                                }
                                if (this.agenda.estado === 'publicada') {
                                    this.estadoT = (this.delDiaDisponibles > 0) ? 'seleccionada' : 'noTurnos';
                                }
                            } else {
                                if (this.agenda.estado === 'publicada') {
                                    (this.programadosDisponibles > 0
                                        || (this.tiposTurnosSelect === 'profesional' && this.profesionalDisponibles > 0)
                                        || (this.tiposTurnosSelect === 'gestion' && this.gestionDisponibles > 0))
                                        ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                                }
                                if (this.agenda.estado === 'disponible') {
                                    ((this.tiposTurnosSelect === 'profesional' && this.profesionalDisponibles > 0)
                                        || (this.tiposTurnosSelect === 'gestion' && this.gestionDisponibles > 0))
                                        ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                                }
                            }
                            // contador de turnos por Bloque
                            this.countBloques = countBloques;
                        }
                    } else {
                        /* Si no hay turnos disponibles, se muestran alternativas (para eso deben haber seteado algún filtro)*/
                        this.estadoT = 'noTurnos';

                        if (this.opciones.tipoPrestacion || this.opciones.profesional) {
                            const params = {
                                fechaDesde: moment(this.agenda.horaInicio).add(1, 'day').toDate(),
                                idTipoPrestacion: this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : null,
                                idProfesional: this.opciones.profesional ? this.opciones.profesional.id : null,
                                estados: ['disponible', 'publicada'],
                                organizacion: this.organizacion.id
                            };
                            this.serviceAgenda.get(params).subscribe(alternativas => {
                                this.alternativas = alternativas;
                                this.reqfiltros = false;
                            });
                        } else {
                            this.reqfiltros = true;
                        }
                    }
                }
            }
        });
    }

    private filtrarBloques(esAgendaDeHoy) {
        // Tipo de Prestación, para poder filtrar las agendas
        const tipoPrestacion: string = this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.conceptId : '';

        this.bloques = this.agenda.bloques.filter(
            (value) => {
                const prestacionesBlq = value.tipoPrestaciones.map((obj) => {
                    return obj.conceptId;
                });
                if (tipoPrestacion) {
                    return (prestacionesBlq.indexOf(tipoPrestacion) >= 0);
                } else {
                    return true;
                }
            }
        );

        // Filtra bloques cuyos tipos prestaciones se correspondan con los permisos del usuario
        if (this.permisos[0] !== '*') {
            this.bloques = this.bloques.filter(bloque => bloque.tipoPrestaciones.some(p => this.permisos.includes(p.id)));
        }

        // Si existe una selección de filtro tipo de prestación, filtra bloques cuyos tipos prestaciones se correspondan con los filtros seleccionados
        if (this.opciones.tipoPrestacion) {
            this.bloques = this.bloques.filter(bloque => bloque.tipoPrestaciones.map(e => e.conceptId).includes(this.opciones.tipoPrestacion.conceptId));
        }

        if (this.tipoTurno === 'gestion' || this.agenda.condicionLlave) {
            if (!this.contieneExclusivoGestion(this.agenda)) {
                // Se muestran solo los bloques que tengan turnos para el tipo correspondiente
                this.bloques = this.bloques.filter(
                    (value) => {
                        if (esAgendaDeHoy) {
                            if (esAgendaDeHoy) {
                                return (value.restantesDelDia) + (value.restantesProgramados) > 0;
                            } else {
                                return ((value.restantesProgramados) + (value.restantesGestion) + (value.restantesProfesional) > 0);
                            }
                        } else {
                            return ((value.restantesProgramados) + (value.restantesGestion) + (value.restantesProfesional) > 0);
                        }
                    });
            }
        } else {
            this.bloques = this.bloques.filter(
                (value) => {
                    if (esAgendaDeHoy) {
                        return (value.restantesDelDia) + (value.restantesProgramados) > 0;
                    } else {
                        return (value.restantesProgramados > 0);
                    }
                });
        }
    }

    /**
    * Se selecciona un turno del listado
    */
    seleccionarTurno(bloque: any, indice: number) {
        if (this.paciente) {
            this.bloque = bloque;
            this.indiceBloque = this.agenda.bloques.indexOf(this.bloque);
            this.indiceTurno = indice;
            this.turno = bloque.turnos[indice];
            if (this.bloque.tipoPrestaciones.length === 1) {
                this.turnoTipoPrestacion = this.bloque.tipoPrestaciones[0];
                this.turno.tipoPrestacion = this.bloque.tipoPrestaciones[0];
            }
            if (this.opciones.tipoPrestacion) {
                this.turno.tipoPrestacion = this.opciones.tipoPrestacion;
                this.turnoTipoPrestacion = this.opciones.tipoPrestacion;
            }
            this.habilitarTurnoDoble();
            this.nota = this.turno.nota;
        } else {
            this.plex.info('warning', 'Debe seleccionar un paciente');
        }
    }

    seleccionarBusqueda(indice: number) {
        this.opciones.tipoPrestacion = this.cacheBusquedas[indice]?.tipoPrestacion;
        this.opciones.profesional = this.cacheBusquedas[indice]?.profesional;
        this.filtrar();
    }

    seleccionarAlternativa(indice: number) {
        this.seleccionarAgenda(this.alternativas);
    }

    verAgenda(direccion: string) {
        if (this.agendasDelDia) {
            // Asegurar que no nos salimos del rango de agendas (agendas.length)
            const enRango = direccion === 'der' ? ((this.indice + 1) < this.agendasDelDia.length) : ((this.indice - 1) >= 0);
            if (enRango) {
                if (direccion === 'der') {
                    if (moment(this.agenda.horaInicio).startOf('day').format() === moment(this.agendasDelDia[this.indice + 1].horaInicio).startOf('day').format()) {
                        this.indice++;
                    }
                } else if (direccion === 'izq') {
                    if (moment(this.agenda.horaInicio).startOf('day').format() === moment(this.agendasDelDia[this.indice - 1].horaInicio).startOf('day').format()) {
                        this.indice--;
                    }
                }
                this.agenda = this.agendasDelDia[this.indice];
                this.seleccionarAgenda(this.agendasDelDia);
            }
        }
    }

    cambiarMes(signo) {
        if (signo === '+') {
            this.opciones.fecha = moment(this.opciones.fecha).add(1, 'M').toDate();
        } else {
            this.opciones.fecha = moment(this.opciones.fecha).subtract(1, 'M').toDate();
        }
        this.actualizar();
    }

    cambiarTelefono(event) {
        if (event.value) {
            this.cambioTelefono = true;
        }
    }

    cumpleEstados() {
        return (this.estadoT === 'seleccionada' || this.estadoT === 'noTurnos' || this.estadoT === 'dinamica');
    }

    tieneTurnosDisponible() {
        return (this.estadoT === 'seleccionada' && (this.opciones.profesional && this.opciones.tipoPrestacion));
    }

    verInexistenciaAlternativas() {
        return (this.estadoT === 'noTurnos' && this.alternativas.length <= 0 && !this.reqfiltros);
    }
    verTipoPrestacion() {
        return (this.bloque && (!this.turno?.tipoPrestacion || (this.agenda?.dinamica && this.bloque.tipoPrestaciones?.length > 1)));
    }
    primerSimultaneoDisponible(bloque: IBloque, turno: ITurno, indiceT: number) {
        return (indiceT - 1 < 0)
            || (turno.horaInicio.getTime() !== bloque.turnos[(indiceT - 1)].horaInicio.getTime())
            || ((turno.horaInicio.getTime() === bloque.turnos[(indiceT - 1)].horaInicio.getTime())
                && (bloque.turnos[(indiceT - 1)].estado !== 'disponible'));
    }

    // Se busca el número de carpeta de la Historia Clínica en papel del paciente
    // a partir del documento y del efector
    obtenerCarpetaPaciente() {
        let indiceCarpeta = -1;
        if (this.paciente.carpetaEfectores.length > 0) {
            // Filtro por organizacion
            indiceCarpeta = this.paciente.carpetaEfectores.findIndex((x: any) => x.organizacion._id === this.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfector = this.paciente.carpetaEfectores[indiceCarpeta];
                this.nroCarpetaOriginal = this.paciente.carpetaEfectores[indiceCarpeta].nroCarpeta;
            }
        }
        if (indiceCarpeta === -1) {
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.servicioCarpetaPaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.organizacion.id }).subscribe(carpeta => {
                // Si la carpeta en carpetaPaciente tiene una longitud mayor a 0, se filtra por organización para obtener nroCarpeta.
                if (carpeta.length > 0) {
                    const carpetaE = carpeta[0].carpetaEfectores.find((carpetaEf: any) => carpetaEf.organizacion._id === this.organizacion.id);
                    if (carpetaE.nroCarpeta) {
                        this.carpetaEfector.nroCarpeta = carpetaE.nroCarpeta;
                        this.changeCarpeta = true;
                    }
                }
            });
        }
    }

    cambiarCarpeta() {
        this.changeCarpeta = true;
    }

    actualizarPaciente() {
        // Si cambió el teléfono lo actualizo en el MPI
        if (this.cambioTelefono) {
            const nuevoCel = {
                tipo: 'celular',
                valor: this.telefono.toString(),
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            };
            // Si posee contactos se agrega nuevo cel al principio
            this.paciente.contacto.length ? this.paciente.contacto.unshift(nuevoCel) : this.paciente.contacto = [nuevoCel];
            // Se actualiza teléfono del paciente en MPI
            const cambios = {
                op: 'updateContactos',
                contacto: this.paciente.contacto
            };
            this.servicePaciente.patch(this.paciente.id, cambios).subscribe(resultado => {
                if (resultado) {
                    this.plex.toast('info', 'Datos del paciente actualizados');
                }
            }, error => {
                this.plex.toast('danger', 'Error actualizando datos de contacto del paciente.');
            });
        }
    }

    turnoDinamico() {
        this.turnoDoble = false;
        this.turno = {};
        if (this.paciente) {
            this.bloque = this.agenda.bloques[0];
            if (this.bloque.tipoPrestaciones.length === 1) {
                this.turnoTipoPrestacion = this.bloque.tipoPrestaciones[0];
                this.turno.tipoPrestacion = this.bloque.tipoPrestaciones[0];
            }
            if (this.opciones.tipoPrestacion) {
                this.turno.tipoPrestacion = this.opciones.tipoPrestacion;
                this.turnoTipoPrestacion = this.opciones.tipoPrestacion;
            }
            this.darTurno();
        } else {
            this.plex.info('warning', 'Debe seleccionar un paciente');
        }
    }

    hayTurnoSuspendido() {
        if (this._solicitudPrestacion) {
            const turno = this._solicitudPrestacion.solicitud.historial.reverse().find((turno) => !!turno.idTurnoSuspendido);

            return turno?.idTurnoSuspendido;
        }

        return false;
    }

    reasignarTurno(turno_id, agenda_actual) {
        this.serviceTurno.get({ id: turno_id }).pipe(
            switchMap((result) => {
                const { agenda_id, bloque_id, bloques } = result[0];

                let turnoReasignado;

                for (const key in bloques) {
                    turnoReasignado = bloques[key].turnos.find(turno => turno._id === turno_id);
                }

                const siguiente = {
                    idAgenda: agenda_id,
                    idBloque: bloque_id,
                    idTurno: turno_id
                };

                if (turnoReasignado?.reasignado) {
                    turnoReasignado.reasignado.siguiente = siguiente;
                } else {
                    turnoReasignado.reasignado = {
                        siguiente: siguiente
                    };
                }

                // Datos del turno "nuevo", que se guardan en el turno "viejo" para poder referenciarlo
                const datosTurnoReasignado = {
                    idAgenda: agenda_id,
                    idBloque: bloque_id,
                    idTurno: turno_id,
                    turno: turnoReasignado
                };

                return this.serviceTurno.put(datosTurnoReasignado);
            })
        ).subscribe(() => {
            this.guardarTurno(agenda_actual);
        });
    }

    /**
     * DAR TURNO
     */
    darTurno() {
        if (this.turnoTipoPrestacion) {
            this.turnoTipoPrestacion['_id'] = this.turnoTipoPrestacion.id;
            this.hideDarTurno = true; // ocultamos el boton confirmar para evitar efecto gatillo facil
            // Ver si cambió el estado de la agenda desde otro lado
            this.serviceAgenda.getById(this.agenda.id).subscribe(agd => {
                if (agd.estado !== 'disponible' && agd.estado !== 'publicada') {
                    this.plex.info('warning', 'Esta agenda ya no está disponible.');
                    this.actualizar();
                    return false;
                } else {
                    if (this.changeCarpeta && this.carpetaEfector.nroCarpeta && this.carpetaEfector.nroCarpeta !== '' && this.carpetaEfector.nroCarpeta !== this.nroCarpetaOriginal) {
                        this.carpetaEfector.nroCarpeta = this.carpetaEfector.nroCarpeta.trim(); // quitamos los espacios
                        const indiceCarpeta = this.paciente.carpetaEfectores.findIndex((x: any) => x.organizacion._id === this.organizacion.id);
                        if (indiceCarpeta > -1) {
                            this.paciente.carpetaEfectores[indiceCarpeta] = this.carpetaEfector;
                        } else {
                            this.paciente.carpetaEfectores.push(this.carpetaEfector);
                        }
                        this.servicePaciente.patch(this.paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this.paciente.carpetaEfectores }).subscribe(
                            resultadoCarpeta => {
                                this.guardarTurno(agd);
                            }, error => {
                                this.plex.toast('danger', 'El número de carpeta ya existe');
                                this.hideDarTurno = false;
                            }
                        );

                    } else {
                        const idTurnoSuspendido = this.hayTurnoSuspendido();

                        idTurnoSuspendido ?
                            this.reasignarTurno(idTurnoSuspendido, agd)
                            :
                            this.guardarTurno(agd);
                    }
                }
            });
        } else {
            this.plex.info('warning', '', 'Seleccione un tipo de prestación');
        }

    }

    private guardarTurno(agd: IAgenda) {
        if (this.numeroAfiliado && this.obraSocialPaciente) {
            this.obraSocialPaciente.numeroAfiliado = this.numeroAfiliado;
        }
        const pacienteSave = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            alias: this.paciente.alias,
            genero: this.paciente.genero,
            fechaNacimiento: this.paciente.fechaNacimiento,
            sexo: this.paciente.sexo,
            telefono: this.telefono,
            carpetaEfectores: this.paciente.carpetaEfectores,
            obraSocial: this.obraSocialPaciente
        };
        if (agd.dinamica) {
            const datosTurno = {
                nota: this.nota,
                motivoConsulta: this.motivoConsulta,
                tipoPrestacion: this.turnoTipoPrestacion,
                paciente: pacienteSave,
                idAgenda: this.agenda.id,
                estadoFacturacion: this.estadoFacturacion,
                emitidoPor: (this.turnoTelefonico) ? 'turno telefonico' : null,
                link: this.link
            };
            this.serviceTurno.saveDinamica(datosTurno).subscribe(
                resultado => {
                    this.turno.id = resultado.id;
                    this.afterSaveTurno(pacienteSave);
                },
                error => {
                    this.agenda = null;
                    this.actualizar();
                    this.plex.toast('danger', 'Turno no asignado');
                    this.hideDarTurno = false;
                    this.volverAlGestor.emit(this.agenda); // devuelve la agenda al gestor, para que éste la refresque
                    this.actualizarPaciente();
                    if (this.paciente && this._pacienteSeleccionado) {
                        this.afterDarTurno.emit(true);
                        return false;
                    } else {
                        this.resetBuscarPaciente();
                    }
                    this.turnoTipoPrestacion = undefined;
                });
        } else {
            this.agenda = agd;
            this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
            this.agenda.bloques[this.indiceBloque].cantidadTurnos = (this.agenda.bloques[this.indiceBloque].cantidadTurnos) - 1;

            // Datos del Turno
            const datosTurno = {
                idAgenda: this.agenda.id,
                idTurno: this.turno.id,
                idBloque: this.bloque.id,
                paciente: pacienteSave,
                tipoPrestacion: this.turnoTipoPrestacion,
                tipoTurno: this.tiposTurnosSelect,
                nota: this.nota,
                motivoConsulta: this.motivoConsulta,
                estadoFacturacion: this.estadoFacturacion,
                emitidoPor: (this.turnoTelefonico) ? 'turno telefonico' : null,
                link: this.link
            };
            this.serviceTurno.save(datosTurno, { showError: false }).subscribe(resultado => {
                this.showTab = 1;
                this.afterSaveTurno(pacienteSave);
            }, (err) => {
                this.hideDarTurno = false;
                // Si el turno no pudo ser otorgado, se verifica si el bloque permite citar por segmento
                // En este caso se trata de dar nuevamente un turno con el siguiente turno disponible con el mismo horario
                if (err && (err === 'noDisponible')) {
                    if (this.agenda.bloques[this.indiceBloque].citarPorBloque && (this.agenda.bloques[this.indiceBloque].turnos.length > (this.indiceTurno + 1))) {
                        const nuevoIndice = this.indiceTurno + 1;
                        if (this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].horaInicio.getTime() === this.agenda.bloques[this.indiceBloque].turnos[nuevoIndice].horaInicio.getTime()) {
                            this.indiceTurno = nuevoIndice;
                            this.turno = this.agenda.bloques[this.indiceBloque].turnos[nuevoIndice];
                            this.afterDarTurno.emit(true);
                            this.darTurno();
                        } else {
                            this.plex.confirm('No se emitió el turno, por favor verifique los turnos disponibles', 'Turno no asignado');
                            this.actualizar();
                        }
                    }
                }
            });
        }
    }

    private afterSaveTurno(pacienteSave) {
        if (!this.agenda.dinamica && this.agenda.enviarSms) {
            this.enviarSMS(pacienteSave);
        }
        this.estadoT = 'noSeleccionada';
        const agendaReturn = this.agenda; // agendaReturn será devuelta al gestor.
        let turnoSiguiente = null;
        if (this.indiceBloque >= 0) {
            turnoSiguiente = this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno + 1];
        }
        const agendaid = this.agenda.id;
        this.agenda = null;
        this.actualizar();
        this.plex.toast('info', 'El turno se asignó correctamente');
        this.hideDarTurno = false;
        this.plex.clearNavbar();
        this.actualizarPaciente();

        if (this._solicitudPrestacion) {
            const params = {
                op: 'asignarTurno',
                idTurno: this.turno.id
            };
            this.servicioPrestacionPaciente.patch(this._solicitudPrestacion.id, params).subscribe(prestacion => {
                this.volverValidacion.emit(prestacion);
            });
        }
        if (this.solicitudVacunacion) {
            const horarioTurno = this.turno.horaInicio || agendaReturn.horaInicio;
            this.afterDarTurno.emit(horarioTurno);
            return;
        }
        if (this.turnoDoble) {
            if (turnoSiguiente.estado === 'disponible') {
                const patch: any = {
                    op: 'darTurnoDoble',
                    turnos: [turnoSiguiente.id]
                };
                // Patchea el turno doble
                this.serviceAgenda.patch(agendaid, patch).subscribe((agendaActualizada) => {
                    if (agendaActualizada) {
                        this.volverAlGestor.emit(agendaReturn); // devuelve la agenda al gestor, para que éste la refresque
                        this.plex.toast('info', 'Se asignó un turno doble');
                    }
                });
            }
        } else {
            // Esto parece estar de más, pero si no está dentro del else no se refrescan los cambios del turno doble.
            this.volverAlGestor.emit(agendaReturn); // devuelve la agenda al gestor, para que éste la refresque
        }
        this.afterDarTurno.emit(pacienteSave);
        if (this.paciente && this._pacienteSeleccionado) {
            return false;
        } else {
            this.resetBuscarPaciente();
        }
        this.turnoTipoPrestacion = undefined; // blanquea el select de tipoPrestacion
    }

    enviarSMS(paciente: any) {
        // Enviar SMS sólo en Producción
        if (environment.production === true && paciente.telefono) {
            const dia = moment(this.turno.horaInicio).format('DD/MMM');
            const horario = moment(this.turno.horaInicio).format('HH:mm');
            // Inicial del nombre. más Apellidos (Max 20 caracteres)
            const nombrePaciente = (paciente.alias || paciente.nombre).substr(0, 1) + '. ' + this.paciente.apellido.substr(0, 20);
            // Max 30 caracteres
            const prestacion = this.turnoTipoPrestacion.term.substr(0, 30);
            let nombreOrganizacion = this.agenda.organizacion.nombre.toLocaleLowerCase();
            // Se reemplazan nombres de organización por abreviaturas
            if (nombreOrganizacion.indexOf('hospital') !== -1) {
                nombreOrganizacion = nombreOrganizacion.replace('hospital', 'HOSP');
            } else if (nombreOrganizacion.indexOf('centro de salud') !== -1) {
                nombreOrganizacion = nombreOrganizacion.replace('centro de salud', 'CS');
            } else if (nombreOrganizacion.indexOf('puesto sanitario') !== -1) {
                nombreOrganizacion = nombreOrganizacion.replace('puesto sanitario', 'PS');
            }
            // Cortar del guion "-" en adelante
            // Max 30 caracteres
            if (nombreOrganizacion.indexOf('-') !== -1) {
                nombreOrganizacion = nombreOrganizacion.substr(0, nombreOrganizacion.indexOf('-'));
                nombreOrganizacion = nombreOrganizacion.substring(0, 30);
            }

            let mensaje = 'Confirmación turno ' + nombrePaciente + ' | ' + dia + ' | ' + horario + 'Hs | ' + prestacion + ' | ' + nombreOrganizacion;
            // Palabra consultorio -> consult. (Max 30 caracteres)
            if (this.agenda.espacioFisico) {
                const consultorioNombre = this.agenda.espacioFisico.nombre.toLocaleLowerCase().replace('consultorio', 'consult.');
                mensaje = mensaje + ' | ' + consultorioNombre.substr(0, 30);
            }
            const smsParams = {
                telefono: paciente.telefono,
                mensaje: mensaje.toLocaleUpperCase(),
            };
            this.smsService.enviarSms(smsParams).subscribe(
                sms => {
                    this.resultado = sms;

                    // "if 0 errores"
                    if (this.resultado === '0') {
                        if (paciente.alias) {
                            this.plex.toast('info', 'Se envió SMS al paciente ' + paciente.alias + ' ' + paciente.apellido);
                        } else {
                            this.plex.toast('info', 'Se envió SMS al paciente ' + paciente.nombre + ' ' + paciente.apellido);
                        }
                    } else {
                        this.plex.toast('danger', 'ERROR: SMS no enviado');
                    }
                },
                err => {
                    if (err) {
                        this.plex.toast('danger', 'Error de servicio');

                    }
                }
            );
        } else {
            this.plex.toast('info', 'INFO: SMS no enviado (activo sólo en Producción)');
        }
    }

    tieneTurnos(bloque: IBloque): boolean {
        const turnos = bloque.turnos;
        if (this.tipoTurno === 'gestion' || this.agenda.condicionLlave) {

            if (this.autocitado && bloque.restantesProfesional > 0) {
                return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy) != null;
            }
            if (!this.autocitado && bloque.restantesGestion > 0) {
                return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy) != null;
            }
        } else {
            const delDia = bloque.horaInicio >= moment().startOf('day').toDate() && bloque.horaInicio <= moment().endOf('day').toDate();
            if (delDia && (bloque.restantesDelDia + bloque.restantesProgramados) > 0) {
                return turnos.find(turno => turno.estado === 'disponible') != null;
            }
            if (!delDia && bloque.restantesProgramados > 0) {
                return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy) != null;
            }
        }
    }

    verificarTelefono(paciente: IPaciente) {
        // se busca entre los contactos si tiene un celular
        this.telefono = paciente?.contacto?.find(c => c.tipo === 'celular')?.valor || '';
    }

    noSeAsignaTurno() {
        if (this.solicitudVacunacion) {
            // se ingresó desde monitoreo de inscriptos
            this.afterDarTurno.emit(null);
            this.plex.clearNavbar();
            this.ponerEnListaEspera();
            return;
        }

        // se ingresó desde citas
        if (this._pacienteSeleccionado) {
            this.afterDarTurno.emit(this.paciente);
        } else {
            this.resetBuscarPaciente();
        }

        this.ponerEnListaEspera();
        this.estadoT = 'noSeleccionada';
        this.turnoTipoPrestacion = undefined; // blanquea el select de tipoprestacion en panel de confirma turno
        this.opciones.tipoPrestacion = undefined; // blanquea el filtro de tipo de prestacion en el calendario
        this.opciones.profesional = undefined; // blanquea el filtro de profesionales en el calendario
        this.afterDarTurno.emit(this.paciente);
        this.plex.clearNavbar();
    }

    // Agrega paciente a lista de espera en caso de no asignarse el turno
    ponerEnListaEspera() {
        let operacion: Observable<IListaEspera>;
        const datosPrestacion = this.opciones.tipoPrestacion;
        const datosProfesional = !this.opciones.profesional ? null : {
            id: this.opciones.profesional.id,
            nombre: this.opciones.profesional.nombre,
            apellido: this.opciones.profesional.apellido
        };
        const datosPaciente: IPacienteBasico = !this.paciente ? null : {
            id: this.paciente.id,
            nombre: this.paciente.nombre,
            alias: this.paciente.alias,
            apellido: this.paciente.apellido,
            documento: this.paciente.documento,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
            fechaNacimiento: this.paciente.fechaNacimiento,
            sexo: this.paciente.sexo,
            genero: this.paciente.genero
        };
        const organizacion = !this.organizacion ? null : {
            id: this.organizacion.id,
            nombre: this.organizacion.nombre
        };
        const listaEspera: any = !this.opciones.tipoPrestacion && !this.opciones.profesional ? null : {
            fecha: new Date(),
            estado: 'Demanda Rechazada',
            tipoPrestacion: datosPrestacion,
            profesional: datosProfesional,
            paciente: datosPaciente,
            organizacion: organizacion
        };
        if (listaEspera !== null) {
            operacion = this.serviceListaEspera.post(listaEspera);
            operacion.subscribe();
        }
    }

    // resetea variables para la pantalla 'buscar paciente'
    resetBuscarPaciente() {
        this.plex.clearNavbar();
        this.showDarTurnos = false;
        this.mostrarCalendario = false;
        this.pacientesSearch = true;
    }

    verificarNota() {
        if (this.nota && this.nota.length > this.lenNota) {
            this.nota = this.nota.substring(0, this.lenNota);
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    /*
    * Determina si se permite seleccionar obra social e ingresar número de afiliado
    * por el momento esto solo es posible desde el efector: Centro médico integral (colegio médico)
    */
    desplegarObraSocial() {
        const puco = this.obraSocialPaciente && this.obraSocialPaciente.codigoPuco ? true : false;
        return (this.organizacion.id === idCMI && !puco);
    }

    agregarSobreturno() {
        this.showSobreturno = !this.showSobreturno;
    }

    public volver() {
        // se ingresó desde monitoreo de inscriptos
        if (this.solicitudVacunacion) {
            this.afterDarTurno.emit(null);
            this.plex.clearNavbar();
            return;
        }
        // se ingresó desde citas
        if (this._pacienteSeleccionado) {
            this.afterDarTurno.emit(this.paciente);
        } else {
            this.resetBuscarPaciente();
        }
    }

}
