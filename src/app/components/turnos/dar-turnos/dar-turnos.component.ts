import { environment } from './../../../../environments/environment';
import * as moment from 'moment';
import { LoginComponent } from './../../login/login.component';
import { Component, AfterViewInit, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { EstadosDarTurnos } from './enums';
import { EstadosAgenda } from './../enums';
import { PrestacionesService } from './../../../modules/rup/services/prestaciones.service';
import { ObraSocialService } from './../../../services/obraSocial.service';

// Interfaces
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IListaEspera } from './../../../interfaces/turnos/IListaEspera';
import { CalendarioDia } from './calendario-dia.class';

// Servicios
import { PacienteService } from '../../../services/paciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
import { SmsService } from './../../../services/turnos/sms.service';
import { TurnoService } from './../../../services/turnos/turno.service';
import { IObraSocial } from '../../../interfaces/IObraSocial';

@Component({
    selector: 'dar-turnos',
    templateUrl: 'dar-turnos.html',
    styleUrls: [
        'dar-turnos.scss'
    ]
})

export class DarTurnosComponent implements OnInit {
    nroCarpetaOriginal: string;
    public lenNota = 140;
    public nota = '';
    public changeCarpeta = false;
    hideDarTurno: boolean;
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    @Input('pacienteSeleccionado')
    set pacienteSeleccionado(value: any) {
        this._pacienteSeleccionado = value;
        this.servicePaciente.getById(this._pacienteSeleccionado.id).subscribe(
            pacienteMPI => {
                this.paciente = pacienteMPI;
                this.verificarTelefono(pacienteMPI);
                this.obtenerCarpetaPaciente();
                this.servicioOS.get(this.paciente.documento).subscribe(resultado => {
                    this.obraSocialPaciente = resultado;
                });
                this.mostrarCalendario = false;
            });
    }
    get pacienteSeleccionado() {
        return this._pacienteSeleccionado;
    }

    @Input('solicitudPrestacion')
    set solicitudPrestacion(value: any) {
        this._solicitudPrestacion = value;
        if (this._solicitudPrestacion) {
            this.servicePaciente.getById(this._solicitudPrestacion.paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.verificarTelefono(pacienteMPI);
                    this.obtenerCarpetaPaciente();
                    this.servicioOS.get(this.paciente.documento).subscribe(resultado => {
                        this.obraSocialPaciente = resultado;
                    });
                });
        }
    }
    get solicitudPrestacion() {
        return this._solicitudPrestacion;
    }

    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancelarDarTurno: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAlGestor = new EventEmitter<any>();
    // usamos este output para volver al componente de validacion de rup
    @Output() volverValidacion = new EventEmitter<any>();

    private _pacienteSeleccionado: any;
    private _solicitudPrestacion: any; // TODO: cambiar por IPrestacion cuando esté
    private paciente: IPaciente;
    private opciones: any = {};
    public agenda: IAgenda;
    public agendas: IAgenda[];
    public estadosAgenda = EstadosAgenda;

    estadoT: EstadosDarTurnos;
    turnoDoble = false;
    telefono: String = '';
    countBloques: any[];
    countTurnos: any = {};
    resultado: any;
    seleccion = null;
    esEscaneado = false;
    ultimosTurnos: any[];
    indice: number = -1;
    semana: String[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    permisos = [];
    autorizado = false;
    pacientesSearch = true;
    showDarTurnos = false;
    cambioTelefono = false;
    showCreateUpdate = false;
    tipoTurno: string;
    tiposTurnosSelect: String;
    tiposTurnosLabel: String;
    filtradas: any = [];
    hoy: Date;
    bloque: IBloque;
    delDiaDisponibles: number;
    turno: ITurno;
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

    // Muestra sólo las agendas a las que se puede asignar el turno (oculta las "con/sin alternativa")
    mostrarNoDisponibles = false;
    // Muestra/Oculta los días de fin de semana (sábado y domingo)
    ocultarFinesDeSemana = false;

    // Opciones para modificar la grilla/calendario
    opcionesCalendario = {
        mostrarFinesDeSemana: true
    };

    private bloques: IBloque[];
    private indiceTurno: number;
    private indiceBloque: number;
    private busquedas: any[] = localStorage.getItem('busquedas') ? JSON.parse(localStorage.getItem('busquedas')) : [];
    private eventoProfesional: any = null;
    private mostrarCalendario = false;

    constructor(
        public serviceProfesional: ProfesionalService,
        public serviceAgenda: AgendaService,
        public serviceListaEspera: ListaEsperaService,
        public serviceTurno: TurnoService,
        public servicePaciente: PacienteService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioPrestacionPaciente: PrestacionesService,
        public servicioOS: ObraSocialService,
        public smsService: SmsService,
        public plex: Plex,
        public auth: Auth,
        private router: Router) { }

    ngOnInit() {
        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.opciones.fecha = moment().toDate();

        this.carpetaEfector = {
            organizacion: {
                _id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');

        if (this._pacienteSeleccionado) {
            this.pacientesSearch = false;
            this.showDarTurnos = true;
        }

        // Filtra las búsquedas en localStorage para que muestre sólo las del usuario logueado
        if (this.busquedas.length > 0) {
            this.busquedas = this.busquedas.filter(busqueda => {
                return busqueda.usuario && busqueda.usuario.documento === this.auth.usuario.documento;
            });
        }
        this.actualizar('');
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF;
            if (this.permisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            }
            event.callback(dataF);
            if (this._solicitudPrestacion) {
                this.actualizar('');
            }
        });
    }

    habilitarTurnoDoble() {
        // Si el siguiente turno está disponible, se habilita la opción de turno doble
        let cantidadTurnos;
        this.permitirTurnoDoble = false;
        let tipoTurnoDoble = this.tiposTurnosSelect.toString();
        let cantidadDisponible = this.countBloques[this.indiceBloque];
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
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else if (this._solicitudPrestacion && this._solicitudPrestacion.solicitud.registros[0].valor.profesionales) {
            // TODO quedaria ver que se va a hacer cuando en la solicitud se tengan mas de un profesional asignado
            let query = {
                nombreCompleto: this._solicitudPrestacion.solicitud.registros[0].valor.profesionales[0].nombreCompleto,
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback(this.opciones.profesional || []);
        }
        this.eventoProfesional = event;
    }

    filtrar() {
        let search = {
            'tipoPrestacion': this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion : null,
            'profesional': this.opciones.profesional ? this.opciones.profesional : null,
            'usuario': this.auth.usuario
        };
        if (this.busquedas.length === 10) {
            this.busquedas.shift();
        }

        if (search.tipoPrestacion || search.profesional) {
            let index = this.busquedas.findIndex(
                item => (item.profesional && search.profesional ? item.profesional._id === search.profesional._id : search.profesional === null) &&
                    (item.tipoPrestacion && search.tipoPrestacion ? item.tipoPrestacion._id === search.tipoPrestacion._id : search.tipoPrestacion === null)
            );
            if (index < 0) {
                this.busquedas.push(search);
                localStorage.setItem('busquedas', JSON.stringify(this.busquedas));
            }
        }
        this.actualizar('');
    }

    /**
     * @param etiqueta: define qué filtros usar para traer todas las Agendas
     */
    actualizar(etiqueta) {
        if (this._solicitudPrestacion) {
            this.opciones.tipoPrestacion = this._solicitudPrestacion.solicitud.tipoPrestacion;
            if (this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true) {
                this.opciones.profesional = [this._solicitudPrestacion.solicitud.profesional];
            }
        }

        // 1) Auth general (si puede ver esta pantalla)
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

        // 2) Permisos
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');

        let params: any = {};
        this.estadoT = 'noSeleccionada';
        this.agendas = [];
        this.agenda = null;

        let fechaHasta = (moment(this.opciones.fecha).endOf('month')).toDate();

        // Filtro búsqueda
        if (this.opciones.tipoPrestacion || this.opciones.profesional) {
            this.mostrarCalendario = true;

            // Agendas a partir de hoy aplicando filtros seleccionados y permisos
            params = {
                rango: true, desde: new Date(), hasta: fechaHasta,
                idTipoPrestacion: (this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : ''),
                organizacion: this.auth.organizacion._id,
                nominalizada: true
            };
            let autocitado = this._solicitudPrestacion && this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion && this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true;
            if (this.opciones.profesional && autocitado) {
                params['idProfesional'] = this.opciones.profesional[0].id;
            } else {
                if (this.opciones.profesional && !autocitado) {
                    params['idProfesional'] = this.opciones.profesional.id;
                }
            }
            if (!this.opciones.tipoPrestacion) {
                params['tipoPrestaciones'] = this.filtradas.map((f) => { return f.id; });
            }
            // Traer las agendas
            this.serviceAgenda.get(params).subscribe(agendas => {
                // Filtrar agendas disponibles o publicadas
                this.agendas = agendas.filter((data) => {
                    if (data.horaInicio >= moment(new Date()).startOf('day').toDate() && data.horaInicio <= moment(new Date()).endOf('day').toDate()) {
                        return (data.estado === 'publicada');
                    } else {
                        if (this._solicitudPrestacion) {
                            return (data.estado === 'disponible' || data.estado === 'publicada');
                        } else {
                            return (data.estado === 'publicada');
                        }
                    }
                });

                // Por defecto no se muestran las agendas que no tienen turnos disponibles
                if (!this.mostrarNoDisponibles) {

                    this.agendas = this.agendas.filter(agenda => {
                        let delDia = agenda.horaInicio >= moment().startOf('day').toDate() && agenda.horaInicio <= moment().endOf('day').toDate();
                        let cond = (agenda.estado === 'publicada' && !this._solicitudPrestacion &&
                            (((agenda.turnosRestantesDelDia + agenda.turnosRestantesProgramados) > 0 && delDia === true && this.hayTurnosEnHorario(agenda))
                                || (agenda.turnosRestantesProgramados > 0 && delDia === false))) ||
                            ((agenda.estado === 'publicada' || agenda.estado === 'disponible') && (this._solicitudPrestacion && ((autocitado && agenda.turnosRestantesProfesional > 0) ||
                                (!autocitado && agenda.turnosRestantesGestion > 0))));
                        return cond;

                    });
                }

                // Por defecto se muestras los días de fines de semana (sab y dom)
                this.opcionesCalendario.mostrarFinesDeSemana = this.ocultarFinesDeSemana ? true : false;

                // Ordena las Agendas por fecha/hora de inicio
                this.agendas = this.agendas.sort((a, b) => {
                    let inia = a.horaInicio ? new Date(a.horaInicio.setHours(0, 0, 0, 0)) : null;
                    let inib = b.horaInicio ? new Date(b.horaInicio.setHours(0, 0, 0, 0)) : null;
                    {
                        return (inia ? (inia.getTime() - inib.getTime() || b.turnosDisponibles - a.turnosDisponibles) : b.turnosDisponibles - a.turnosDisponibles);
                    };
                });

            });
        } else {
            this.mostrarCalendario = false;
        }
    }

    hayTurnosEnHorario(agenda) {
        let ultimoBloque = agenda.bloques.length - 1;
        let ultimoTurno = agenda.bloques[ultimoBloque].turnos.length - 1;
        let ultimahora = moment(agenda.horaFin).format();
        let horaLimite = (moment(new Date()).format());
        let resolucion = (ultimahora > horaLimite);
        return resolucion;
    }

    hayTurnosDisponibles(agenda) {
        return agenda.bloques.filter(bloque => {
            return bloque.filter(turno => {
                return turno.estado === 'disponible';
            });
        }).length > 0;
    }

    /**
     * Selecciona una Agenda (click en el calendario)
     */
    seleccionarAgenda(agenda) {
        // Asigno agenda
        this.agenda = agenda;
        let agendaDeHoy = this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate();
        let turnoAnterior = null;
        this.turnoDoble = false;
        // Ver si cambió el estado de la agenda en otro lado
        this.serviceAgenda.getById(this.agenda.id).subscribe(a => {

            // Si cambió el estado y ya no está disponible ni publicada, mostrar un alerta y cancelar cualquier operación
            if (a.estado !== 'disponible' && a.estado !== 'publicada') {

                this.plex.info('warning', 'Esta agenda ya no está disponible.');
                return false;

            } else {

                this.alternativas = [];

                // Tipo de Prestación, para poder filtrar las agendas
                let tipoPrestacion: String = this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : '';

                // Se filtran los bloques segun el filtro tipoPrestacion
                this.bloques = this.agenda.bloques.filter(
                    function (value) {
                        let prestacionesBlq = value.tipoPrestaciones.map(function (obj) {
                            return obj.id;
                        });
                        if (tipoPrestacion) {
                            return (prestacionesBlq.indexOf(tipoPrestacion) >= 0);
                        } else {
                            return true;
                        }
                    }
                );

                // Se muestran solo los bloques que tengan turnos para el tipo correspondiente
                this.bloques = this.bloques.filter(
                    function (value) {
                        if (agendaDeHoy) {
                            return (value.restantesDelDia) + (value.restantesProgramados) > 0;
                        } else {
                            return ((value.restantesProgramados) + (value.reservadoGestion) + (value.restantesProfesional) > 0);
                        }
                    }
                );

                if (this.agenda) {

                    let idAgendas = this.agendas.map(elem => {
                        return elem.id;
                    });

                    this.indice = idAgendas.indexOf(this.agenda.id);

                    // Usamos CalendarioDia para hacer chequeos
                    let cal = new CalendarioDia(null, this.agenda, this._solicitudPrestacion);

                    /*Si hay turnos disponibles para la agenda, se muestra en el panel derecho*/
                    if (cal.estado !== 'ocupado') {

                        // Tiene solicitud "papelito"?
                        if (this._solicitudPrestacion) {

                            // Es autocitado?
                            if (this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true) {
                                this.tiposTurnosSelect = 'profesional';
                            } else {
                                this.tiposTurnosSelect = 'gestion';
                            }
                        } else {

                            if (this.agenda.estado === 'publicada') {
                                this.tiposTurnosSelect = 'programado';
                            }
                        }

                        let countBloques = [];
                        this.delDiaDisponibles = 0;
                        this.programadosDisponibles = 0;
                        this.gestionDisponibles = 0;
                        this.profesionalDisponibles = 0;

                        this.agenda.bloques.forEach((bloque, indexBloque) => {
                            countBloques.push({
                                // Si la agenda es de hoy los programados se suman a los del día
                                delDia: agendaDeHoy ? (bloque.restantesDelDia as number) + (bloque.restantesProgramados as number) : bloque.restantesDelDia,
                                programado: agendaDeHoy ? 0 : bloque.restantesProgramados,
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
                        if (agendaDeHoy) {
                            this.tiposTurnosSelect = 'delDia';
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
                    } else {

                        /*Si no hay turnos disponibles, se muestran alternativas (para eso deben haber seteado algún filtro)*/
                        this.estadoT = 'noTurnos';

                        if (this.opciones.tipoPrestacion || this.opciones.profesional) {
                            this.serviceAgenda.get({
                                fechaDesde: moment(this.agenda.horaInicio).add(1, 'day').toDate(),
                                idTipoPrestacion: this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : null,
                                idProfesional: this.opciones.profesional ? this.opciones.profesional.id : null,
                                estados: ['disponible', 'publicada']
                            }).subscribe(alternativas => {
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

    seleccionarTurno(bloque: any, indice: number) {

        this.turnoDoble = false;
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
            this.estadoT = 'confirmacion';
        } else {
            this.plex.info('warning', 'Debe seleccionar un paciente');
        }
    }

    seleccionarBusqueda(indice: number) {
        this.opciones.tipoPrestacion = this.busquedas[indice].tipoPrestacion;
        let actualizarProfesional = (this.opciones.profesional === this.busquedas[indice].profesional);
        this.opciones.profesional = this.busquedas[indice].profesional;
        if (!actualizarProfesional && this.eventoProfesional) {
            this.eventoProfesional.callback(this.busquedas[indice].profesional);
        }
        this.actualizar('');
    }

    seleccionarUltimoTurno(turno) {
        this.opciones.tipoPrestacion = turno.tipoPrestacion;
        let actualizarProfesional = (this.opciones.profesional === turno.profesionales);
        this.opciones.profesional = turno.profesionales[0];
        // TODO revisar carga de profesional, idem solicitudes
        // if (!actualizarProfesional && this.eventoProfesional) {
        //     this.eventoProfesional.callback(this.opciones.profesional);
        // }
        this.actualizar('');
    }

    seleccionarAlternativa(indice: number) {
        this.seleccionarAgenda(this.alternativas[indice]);
    }

    verAgenda(direccion: String) {
        if (this.agendas) {
            // Asegurar que no nos salimos del rango de agendas (agendas.length)
            let enRango = direccion === 'der' ? ((this.indice + 1) < this.agendas.length) : ((this.indice - 1) >= 0);
            if (enRango) {
                if (direccion === 'der') {
                    if (moment(this.agenda.horaInicio).startOf('day').format() === moment(this.agendas[this.indice + 1].horaInicio).startOf('day').format()) {
                        this.indice++;
                    }
                } else if (direccion === 'izq') {
                    if (moment(this.agenda.horaInicio).startOf('day').format() === moment(this.agendas[this.indice - 1].horaInicio).startOf('day').format()) {
                        this.indice--;
                    }
                }
                this.agenda = this.agendas[this.indice];
                this.seleccionarAgenda(this.agenda);
            }
        }
    }

    cambiarMes(signo) {
        if (signo === '+') {
            this.opciones.fecha = moment(this.opciones.fecha).add(1, 'M').toDate();
        } else {
            this.opciones.fecha = moment(this.opciones.fecha).subtract(1, 'M').toDate();
        }
        this.actualizar('');
    }

    cambiarTelefono() {
        this.cambioTelefono = true;
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
            indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => (x.organizacion as any)._id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfector = this.paciente.carpetaEfectores[indiceCarpeta];
                this.nroCarpetaOriginal = this.paciente.carpetaEfectores[indiceCarpeta].nroCarpeta;
            }
        }
        if (indiceCarpeta === -1) {
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.servicePaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    this.carpetaEfector.nroCarpeta = carpeta.nroCarpeta;
                    this.changeCarpeta = true;
                }
            });
        }
    }

    cambiarCarpeta() {
        this.changeCarpeta = true;
    }

    getUltimosTurnos() {
        let ultimosTurnos = [];
        this.serviceAgenda.find(this.paciente.id).subscribe(agendas => {
            agendas.forEach((agenda, indexAgenda) => {
                agenda.bloques.forEach((bloque, indexBloque) => {
                    bloque.turnos.forEach((turno, indexTurno) => {
                        if (turno.paciente) {
                            // TODO. agregar la condicion turno.asistencia
                            if (turno.paciente.id === this.paciente.id) {
                                ultimosTurnos.push({
                                    tipoPrestacion: turno.tipoPrestacion,
                                    horaInicio: turno.horaInicio,
                                    estado: turno.estado,
                                    organizacion: agenda.organizacion.nombre,
                                    profesionales: agenda.profesionales
                                });
                            }
                        }
                    });
                });
            });
            if (this.permisos[0] !== '*') {
                this.ultimosTurnos = ultimosTurnos.filter(ultimo => {
                    return this.permisos.indexOf(ultimo.tipoPrestacion.id) >= 0;
                });

            } else {
                this.ultimosTurnos = ultimosTurnos;
            }
        });

    }

    actualizarPaciente() {
        // Si cambió el teléfono lo actualizo en el MPI
        if (this.cambioTelefono) {
            let nuevoCel = {
                tipo: 'celular',
                valor: this.telefono,
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            };

            let flagTelefono = false;

            // Si tiene un celular con ranking 0 (el más alto) y está activo, se reemplaza el número
            // si no, se genera un nuevo contacto
            if (this.paciente.contacto.length > 0) {
                this.paciente.contacto.forEach((contacto, index) => {
                    if (contacto.tipo === 'celular') {
                        contacto.valor = this.telefono;
                        flagTelefono = true;
                    }
                });
                if (!flagTelefono) {
                    this.paciente.contacto.push(nuevoCel);
                }
            } else {
                this.paciente.contacto = [nuevoCel];
            }
            // Actualizo teléfono del paciente en MPI
            let cambios = {
                'op': 'updateContactos',
                'contacto': this.paciente.contacto
            };
            this.servicePaciente.patch(this.paciente.id, cambios).subscribe(resultado => {
                if (resultado) {
                    this.plex.toast('info', 'Datos del paciente actualizados');
                }
            });
        }
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
                    this.actualizar('');
                    return false;
                } else {
                    if (this.changeCarpeta && this.carpetaEfector.nroCarpeta && this.carpetaEfector.nroCarpeta !== '' && this.carpetaEfector.nroCarpeta !== this.nroCarpetaOriginal) {
                        this.carpetaEfector.nroCarpeta = this.carpetaEfector.nroCarpeta.trim(); // quitamos los espacios
                        let indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => (x.organizacion as any)._id === this.auth.organizacion.id);
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
                                console.log(error);
                                this.hideDarTurno = false;
                            }
                        );

                    } else {
                        this.guardarTurno(agd);
                    }
                };
            });
        } else {
            this.plex.alert('', 'Seleccione un tipo de prestación');
        }

    }

    private guardarTurno(agd: IAgenda) {
        let pacienteSave = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            alias: this.paciente.alias,
            fechaNacimiento: this.paciente.fechaNacimiento,
            sexo: this.paciente.sexo,
            telefono: this.telefono,
            carpetaEfectores: this.paciente.carpetaEfectores,
            obraSocial: this.obraSocialPaciente
        };
        this.agenda = agd;
        this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
        this.agenda.bloques[this.indiceBloque].cantidadTurnos = (this.agenda.bloques[this.indiceBloque].cantidadTurnos) - 1;
        let turnoSiguiente = this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno + 1];
        let agendaid = this.agenda.id;
        // Datos del Turno
        let datosTurno = {
            idAgenda: this.agenda.id,
            idTurno: this.turno.id,
            idBloque: this.bloque.id,
            paciente: pacienteSave,
            tipoPrestacion: this.turnoTipoPrestacion,
            tipoTurno: this.tiposTurnosSelect,
            nota: this.nota,
            motivoConsulta: this.motivoConsulta
        };
        this.serviceTurno.save(datosTurno, { showError: false }).subscribe(resultado => {
            this.estadoT = 'noSeleccionada';
            let agendaReturn = this.agenda; // agendaReturn será devuelta al gestor.
            this.agenda = null;
            this.actualizar('');
            this.plex.toast('info', 'El turno se asignó correctamente');
            this.hideDarTurno = false;
            // Enviar SMS sólo en Producción
            if (environment.production === true) {
                let dia = moment(this.turno.horaInicio).format('DD/MM/YYYY');
                let horario = moment(this.turno.horaInicio).format('HH:mm');
                // let mensaje = 'Usted tiene un turno el dia ' + dia + ' a las ' + horario + ' hs. para ' + datosTurno.tipoPrestacion.nombre;
                let mensaje = this.paciente.apellido + ' el ' + agendaReturn.organizacion.nombre + ' le recuerda su turno de ' + datosTurno.tipoPrestacion.nombre +
                    ' el dia ' + dia + ' a las ' + horario + ' hs. ';
                if (agendaReturn.espacioFisico) {
                    mensaje = mensaje + 'en ' + agendaReturn.espacioFisico.nombre + '.';
                }
                this.enviarSMS(pacienteSave, mensaje);
            } else {
                this.plex.toast('info', 'INFO: SMS no enviado (activo sólo en Producción)');
            }
            if (this._solicitudPrestacion) {
                let params = {
                    op: 'asignarTurno',
                    idTurno: this.turno.id
                };
                this.servicioPrestacionPaciente.patch(this._solicitudPrestacion.id, params).subscribe(prestacion => {
                    this.volverValidacion.emit(prestacion);
                });
            }
            if (this.turnoDoble) {
                if (turnoSiguiente.estado === 'disponible') {
                    let patch: any = {
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
                // Esto parece estar al pedo, pero si no está dentro del else no se refrescan los cambios del turno doble.
                this.volverAlGestor.emit(agendaReturn); // devuelve la agenda al gestor, para que éste la refresque
            }
            this.actualizarPaciente();
            if (this.paciente && this._pacienteSeleccionado) {
                this.cancelarDarTurno.emit(true);
                return false;
            } else {
                this.buscarPaciente();
            }
            this.turnoTipoPrestacion = undefined; // blanquea el select de tipoPrestacion
        }, (err) => {
            this.hideDarTurno = false;
            // Si el turno no pudo ser otorgado, se verifica si el bloque permite citar por segmento
            // En este caso se trata de dar nuevamente un turno con el siguiente turno disponible con el mismo horario
            if (err && (err === 'noDisponible')) {
                if (this.agenda.bloques[this.indiceBloque].citarPorBloque && (this.agenda.bloques[this.indiceBloque].turnos.length > (this.indiceTurno + 1))) {
                    let nuevoIndice = this.indiceTurno + 1;
                    if (this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].horaInicio.getTime() === this.agenda.bloques[this.indiceBloque].turnos[nuevoIndice].horaInicio.getTime()) {
                        this.indiceTurno = nuevoIndice;
                        this.turno = this.agenda.bloques[this.indiceBloque].turnos[nuevoIndice];
                        this.cancelarDarTurno.emit(true);
                        this.darTurno();
                    } else {
                        this.plex.confirm('No se emitió el turno, por favor verifique los turnos disponibles', 'Turno no asignado');
                        this.actualizar('');
                    }
                } else {
                    this.plex.confirm('No se emitió el turno, por favor  verifique los turnos disponibles', 'Turno no asignado');
                    this.actualizar('');
                }
            }
        });
    }

    enviarSMS(paciente: any, mensaje) {
        let smsParams = {
            telefono: paciente.telefono,
            mensaje: mensaje,
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
                    this.plex.toast('danger', 'ERROR: Servicio caído');

                }
            }
        );
    }

    tieneTurnos(bloque: IBloque): boolean {
        let turnos = bloque.turnos;
        if (this._solicitudPrestacion) {
            let autocitado = this._solicitudPrestacion && this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion && this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true;
            if (autocitado && bloque.restantesProfesional > 0) {
                return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy) != null;
            }
            if (!autocitado && bloque.restantesGestion > 0) {
                return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy) != null;
            }
        } else {
            let delDia = bloque.horaInicio >= moment().startOf('day').toDate() && bloque.horaInicio <= moment().endOf('day').toDate();
            if (delDia && (bloque.restantesDelDia + bloque.restantesProgramados) > 0) {
                return turnos.find(turno => turno.estado === 'disponible') != null;
            }
            if (!delDia && bloque.restantesProgramados > 0) {
                return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy) != null;
            }
        }
    }

    afterCreateUpdate(paciente) {
        this.showCreateUpdate = false;
        this.showDarTurnos = true;
        if (paciente) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.verificarTelefono(pacienteMPI);
                    this.obtenerCarpetaPaciente();
                    this.servicioOS.get(this.paciente.documento).subscribe(resultado => {
                        this.obraSocialPaciente = resultado;
                    });
                });
        } else {
            this.buscarPaciente();
        }
    }

    afterSearch(paciente: IPaciente): void {
        this.paciente = paciente;
        this.showDarTurnos = true;

        if (paciente.id) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.pacientesSearch = false;
                    this.verificarTelefono(this.paciente);
                    window.setTimeout(() => this.pacientesSearch = false, 100);
                    this.obtenerCarpetaPaciente();
                    this.getUltimosTurnos();
                    if (!this.paciente.scan) {
                        this.servicePaciente.patch(paciente.id, { op: 'updateScan', scan: paciente.scan }).subscribe();
                    }
                    this.servicioOS.get(this.paciente.documento).subscribe(resultado => {
                        this.obraSocialPaciente = resultado;
                    });
                });
        } else {
            this.seleccion = paciente;
            this.esEscaneado = true;
            this.escaneado.emit(this.esEscaneado);
            this.selected.emit(this.seleccion);
            this.showDarTurnos = false;
        }
    }

    verificarTelefono(paciente: IPaciente) {
        // se busca entre los contactos si tiene un celular
        this.telefono = '';
        this.cambioTelefono = false;
        if (paciente && paciente.contacto) {
            if (paciente.contacto.length > 0) {
                paciente.contacto.forEach((contacto) => {
                    if (contacto.tipo === 'celular') {
                        this.telefono = contacto.valor;
                    }
                });
            }
        }
    }

    noSeAsignaTurno() {
        let listaEspera: any;
        let operacion: Observable<IListaEspera>;
        let datosPrestacion = !this.opciones.tipoPrestacion ? null : {
            id: this.opciones.tipoPrestacion.id,
            nombre: this.opciones.tipoPrestacion.nombre
        };
        let datosProfesional = !this.opciones.profesional ? null : {
            id: this.opciones.profesional.id,
            nombre: this.opciones.profesional.nombre,
            apellido: this.opciones.profesional.apellido
        };
        let datosPaciente = !this.paciente ? null : {
            id: this.paciente.id,
            nombre: this.paciente.nombre,
            apellido: this.paciente.apellido,
            documento: this.paciente.documento
        };
        listaEspera = !this.agenda ? null : {
            fecha: this.agenda.horaInicio,
            estado: 'Demanda Rechazada',
            tipoPrestacion: datosPrestacion,
            profesional: datosProfesional,
            paciente: datosPaciente,
        };
        if (listaEspera !== null) {
            operacion = this.serviceListaEspera.post(listaEspera);
            operacion.subscribe();
        }

        if (this._pacienteSeleccionado) {
            // this.router.navigate(['./' + 'puntoInicioTurnos']);
            this.cancelarDarTurno.emit(true);
        } else {
            this.buscarPaciente();
        }
        this.turnoTipoPrestacion = undefined; // blanquea el select de tipoprestacion
        this.estadoT = 'noSeleccionada';
    }

    buscarPaciente() {
        this.showDarTurnos = false;
        this.mostrarCalendario = false;
        this.pacientesSearch = true;
    }

    verificarNota() {
        if (this.nota && this.nota.length > this.lenNota) {
            this.nota = this.nota.substring(0, this.lenNota);
        }
    }

    cancelar() {
        this.showDarTurnos = false;
        this.volverAlGestor.emit(true);
    }

    volver() {
        this.showDarTurnos = false;
        this.estadoT = 'noSeleccionada';
        this.turnoTipoPrestacion = undefined; // blanquea el select de tipoprestacion en panel de confirma turno
        this.opciones.tipoPrestacion = undefined; // blanquea el filtro de tipo de prestacion en el calendario
        this.opciones.profesional = undefined; // blanquea el filtro de profesionales en el calendario
        this.cancelarDarTurno.emit(true);
        this.buscarPaciente();
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}
