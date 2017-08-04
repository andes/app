import { environment } from './../../../../environments/environment';
import { Component, AfterViewInit, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { EstadosDarTurnos } from './enums';
import { EstadosAgenda } from './../enums';

// Interfaces
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IListaEspera } from './../../../interfaces/turnos/IListaEspera';
import { ILlavesTipoPrestacion } from './../../../interfaces/llaves/ILlavesTipoPrestacion';
import { CalendarioDia } from './calendario-dia.class';

// Servicios
import { PacienteService } from '../../../services/paciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
import { PrestacionPacienteService } from '../../../services/rup/prestacionPaciente.service';
import { SmsService } from './../../../services/turnos/sms.service';
import { TurnoService } from './../../../services/turnos/turno.service';
import { LlavesTipoPrestacionService } from './../../../services/llaves/llavesTipoPrestacion.service';

@Component({
    selector: 'dar-turnos',
    templateUrl: 'dar-turnos.html'
})

export class DarTurnosComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    @Input('pacienteSeleccionado')
    set pacienteSeleccionado(value: any) {
        this._pacienteSeleccionado = value;
        this.paciente = value;
    }
    get pacienteSeleccionado() {
        return this._pacienteSeleccionado;
    }

    @Input('solicitudPrestacion')
    set solicitudPrestacion(value: any) {
        this._solicitudPrestacion = value;
        if (this._solicitudPrestacion) {
            this.paciente = this._solicitudPrestacion.paciente;
        }
    }
    get solicitudPrestacion() {
        return this._solicitudPrestacion;
    }

    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancelarDarTurno: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAlGestor = new EventEmitter<boolean>();

    private _pacienteSeleccionado: any;
    private _solicitudPrestacion: any; // TODO: cambiar por IPrestacion cuando esté
    private paciente: IPaciente;
    private opciones: any = {};
    public agenda: IAgenda;
    public agendas: IAgenda[];
    public estadosAgenda = EstadosAgenda;

    llaveTP: any;
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
    llaves: any = [];
    hoy: Date;
    bloque: IBloque;
    delDiaDisponibles: number;
    turno: ITurno;
    programadosDisponibles: number;
    gestionDisponibles: number;
    profesionalDisponibles: number;
    turnoTipoPrestacion: any = {};
    alternativas: any[] = [];
    reqfiltros = false;
    permitirTurnoDoble = false;
    carpetaEfector: any;
    private bloques: IBloque[];
    private indiceTurno: number;
    private indiceBloque: number;
    private busquedas: any[] = localStorage.getItem('busquedas') ? JSON.parse(localStorage.getItem('busquedas')) : [];
    private eventoProfesional: any = null;


    constructor(
        public serviceProfesional: ProfesionalService,
        public serviceAgenda: AgendaService,
        public serviceListaEspera: ListaEsperaService,
        public serviceTurno: TurnoService,
        public servicePaciente: PacienteService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioPrestacionPaciente: PrestacionPacienteService,
        private llaveTipoPrestacionService: LlavesTipoPrestacionService,
        public smsService: SmsService,
        public plex: Plex,
        public auth: Auth,
        private router: Router) { }

    ngOnInit() {
        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.opciones.fecha = moment().toDate();
        // this.opciones.tipoPrestacion = this._solicitudPrestacion.solicitud.registros[0].concepto;
        this.carpetaEfector = { organizacion: this.auth.organizacion, nroCarpeta: '' };
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        if (this._pacienteSeleccionado) {
            this.paciente = this._pacienteSeleccionado;
            this.pacientesSearch = false;
            this.showDarTurnos = true;
        }
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            let data2 = this.verificarLlaves(dataF, event);
        });
    }

    habilitarTurnoDoble() {
        // Si el siguiente turno está disponible, se habilita la opción de turno doble
        let cantidadTurnos;
        this.permitirTurnoDoble = false;
        let tipoTurnoDoble = this.tiposTurnosSelect.toString();
        let cantidadDisponible = this.countBloques[this.indiceBloque];
        if (this.agenda.bloques[this.indiceBloque].cantidadTurnos) {
            cantidadTurnos = this.agenda.bloques[this.indiceBloque].cantidadTurnos;
            cantidadTurnos--;
            if (this.indiceTurno < cantidadTurnos && (cantidadDisponible[tipoTurnoDoble] >= 2)) {
                // se verifica el estado del siguiente turno, si está disponible se permite la opción de turno doble
                if (this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno + 1].estado === 'disponible') {
                    this.permitirTurnoDoble = true;
                }
            }
        }
    }

    public verificarLlaves(tipoPrestaciones: any[], event) {
        tipoPrestaciones.forEach((tipoPrestacion, index) => {
            let band = true;
            this.llaveTipoPrestacionService.get({ idTipoPrestacion: tipoPrestacion.id, activa: true }).subscribe(
                llaves => {
                    this.llaveTP = llaves[0];
                    if (!this.llaveTP) {
                        band = true;
                    } else {
                        // Verifico que si la llave tiene rango de edad, el paciente esté en ese rango
                        if (this.llaveTP.llave && this.llaveTP.llave.edad && this.paciente) {
                            let edad = new EdadPipe().transform(this.paciente, []);
                            // Edad desde
                            if (this.llaveTP.llave.edad.desde) {
                                let edadDesde = String(this.llaveTP.llave.edad.desde.valor) + ' ' + this.llaveTP.llave.edad.desde.unidad;
                                if (edad < edadDesde) {
                                    band = false;
                                }
                            }
                            // Edad hasta
                            if (this.llaveTP.llave.edad.hasta) {
                                let edadHasta = String(this.llaveTP.llave.edad.hasta.valor) + ' ' + this.llaveTP.llave.edad.hasta.unidad;
                                if (edad > edadHasta) {
                                    band = false;
                                }
                            }
                        }
                        // Verifico que si la llave tiene seteado sexo, el sexo del paciente coincida
                        if (this.llaveTP.llave && this.llaveTP.llave.sexo && this.paciente) {
                            if (this.llaveTP.llave.sexo !== this.paciente.sexo) {
                                band = false;
                            }
                        }
                    }
                    if (band) {
                        this.filtradas.push(tipoPrestacion);
                        if (this.llaveTP) {
                            this.llaves = [...this.llaves, this.llaveTP];
                        }
                    }
                },
                err => {
                    if (err) {
                        band = false;
                    }
                }, () => {
                    if (tipoPrestaciones.length - 1 === index) {
                        // event.callback(this.filtradas);
                        // Se actualiza el calendario con las agendas filtradas por permisos y llaves
                        this.cargarDatosLlaves(event);
                    }
                });
        });
    }

    cargarDatosLlaves(event) {
        if (this.llaves.length === 0) {

            event.callback(this.filtradas);
            if (!this._solicitudPrestacion) {
                this.actualizar('sinFiltro');
            } else {
                this.actualizar('');
            }

        } else {
            this.llaves.forEach((cadaLlave, indiceLlave) => {
                let solicitudVigente = false;
                // Si la llave requiere solicitud, verificamos en prestacionPaciente la fecha de solicitud
                if (cadaLlave.llave && cadaLlave.llave.solicitud && this.paciente) {
                    let params = {
                        estado: 'pendiente',
                        idPaciente: this.paciente.id,
                        idTipoPrestacion: cadaLlave.tipoPrestacion.id
                    };
                    this.servicioPrestacionPaciente.get(params).subscribe(
                        prestacionPaciente => {
                            if (prestacionPaciente.length > 0) {
                                if (cadaLlave.llave.solicitud.vencimiento) {

                                    if (cadaLlave.llave.solicitud.vencimiento.unidad === 'Días') {
                                        this.llaves[indiceLlave].profesional = prestacionPaciente[0].solicitud.profesional;
                                        this.llaves[indiceLlave].organizacion = prestacionPaciente[0].solicitud.organizacion;
                                        this.llaves[indiceLlave].fechaSolicitud = prestacionPaciente[0].solicitud.fecha;
                                        // Controla si la solicitud está vigente
                                        let end = moment(prestacionPaciente[0].solicitud.fecha).add(cadaLlave.llave.solicitud.vencimiento.valor, 'days');
                                        solicitudVigente = moment().isBefore(end);
                                        this.llaves[indiceLlave].solicitudVigente = solicitudVigente;
                                        if (!solicitudVigente) {
                                            let indiceFiltradas = this.filtradas.indexOf(cadaLlave);
                                            this.filtradas.splice(indiceFiltradas, 1);
                                            this.filtradas = [...this.filtradas];
                                        }
                                    }
                                }
                            } else {
                                // Si no existe una solicitud para el paciente y el tipo de prestacion, saco la llave de la lista y saco la prestacion del select
                                this.llaves.splice(indiceLlave, 1);
                                this.llaves = [...this.llaves];

                                let indiceFiltradas = this.filtradas.indexOf(cadaLlave);
                                this.filtradas.splice(indiceFiltradas, 1);
                                this.filtradas = [...this.filtradas];
                            }
                        },
                        err => {
                            if (err) {
                            }
                        },
                        () => {
                            event.callback(this.filtradas);
                            this.actualizar('sinFiltro');
                        }
                    );

                } else {
                    // Elimino la llave del arreglo
                    let ind = this.llaves.indexOf(cadaLlave);
                    this.llaves.splice(ind, 1);
                    this.llaves = [...this.llaves];

                    let indiceFiltradas = this.filtradas.indexOf(cadaLlave);
                    this.filtradas.splice(indiceFiltradas, 1);
                    this.filtradas = [...this.filtradas];
                }
            });
        }
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else if (this._solicitudPrestacion && this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true) {
            let query = {
                nombreCompleto: this._solicitudPrestacion.solicitud.profesional.nombreCompleto
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
            'profesional': this.opciones.profesional ? this.opciones.profesional : null
        };
        if (this.busquedas.length === 4) {
            this.busquedas.shift();
        }

        if (search.tipoPrestacion || search.profesional) {
            this.busquedas.push(search);
            localStorage.setItem('busquedas', JSON.stringify(this.busquedas));
        }

        this.actualizar('');
    }

    /**
     *
     * @param etiqueta: define qué filtros usar para traer todas las Agendas
     */
    actualizar(etiqueta) {
        if (this._solicitudPrestacion) {
            this.opciones.tipoPrestacion = this._solicitudPrestacion.solicitud.registros[0].concepto;
            this.opciones.profesional = [this._solicitudPrestacion.solicitud.profesional];
        }

        // 1) Auth general (si puede ver esta pantalla)
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

        // 2) Permisos
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');

        let params: any = {};
        this.estadoT = 'noSeleccionada';
        this.agenda = null;

        let fechaHasta = (moment(this.opciones.fecha).endOf('month')).toDate();

        if (etiqueta !== 'sinFiltro') {

            // Filtro búsqueda
            params = {
                // Mostrar sólo las agendas a partir de hoy en adelante
                rango: true, desde: new Date(), hasta: fechaHasta,
                idTipoPrestacion: (this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : ''),
                idProfesional: (this.opciones.profesional ? this.opciones.profesional.id : ''),
                organizacion: this.auth.organizacion._id,
                nominalizada: true
            };

        } else {
            // Resetear opciones
            this.opciones.tipoPrestacion = null;
            this.opciones.profesional = null;
            params = {
                // Mostrar sólo las agendas a partir de hoy en adelante
                rango: true, desde: new Date(), hasta: fechaHasta,
                // tipoPrestaciones: this.permisos,
                tipoPrestaciones: this.filtradas.map((f) => { return f.id; }),
                organizacion: this.auth.organizacion._id,
                nominalizada: true
            };

        }
        // Traer las agendas
        this.serviceAgenda.get(params).subscribe(agendas => {

            // Sólo traer agendas disponibles o publicadas
            this.agendas = agendas.filter((data) => {
                if (data.horaInicio >= moment(new Date()).startOf('day').toDate() && data.horaInicio <= moment(new Date()).endOf('day').toDate()) {
                    return (data.estado === 'publicada');
                } else {
                    if (this._solicitudPrestacion) {
                        return (data.estado === 'disponible');
                    } else {
                        return (data.estado === 'publicada');
                        // return (data.estado === 'disponible' || data.estado === 'publicada');
                    }
                }
            });

            // Ordena las Agendas por fecha/hora de inicio
            this.agendas = this.agendas.sort(
                function (a, b) {
                    let inia = a.horaInicio ? new Date(a.horaInicio.setHours(0, 0, 0, 0)) : null;
                    let inib = b.horaInicio ? new Date(b.horaInicio.setHours(0, 0, 0, 0)) : null;
                    {
                        return inia ? (inia.getTime() - inib.getTime() || b.turnosDisponibles - a.turnosDisponibles) : b.turnosDisponibles - a.turnosDisponibles;
                    }
                }
            );

        });
    }

    /**
     * Selecciona una Agenda (click en el calendario)
     * @param agenda: objeto con una agenda completa
     */
    seleccionarAgenda(agenda) {
        // Asigno agenda
        this.agenda = agenda;
        let turnoAnterior = null;
        this.turnoDoble = false;
        // Ver si cambió el estado de la agenda en otro lado
        this.serviceAgenda.getById(this.agenda.id).subscribe(a => {

            // Si cambió el estado y ya no está disponible ni publicada, mostrar un alerta y cancelar cualquier operación
            if (a.estado !== 'disponible' && a.estado !== 'publicada') {

                this.plex.info('warning', 'Esta agenda ya no está disponible.');
                return false;

            } else {

                this.bloques = this.agenda.bloques;
                this.alternativas = [];

                // Tipo de Prestación, para poder filtrar las agendas
                let tipoPrestacion: String = this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : '';

                /*Filtra los bloques segun el filtro tipoPrestacion*/
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

                        let agendaDeHoy = this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate();
                        this.agenda.bloques.forEach((bloque, indexBloque) => {
                            countBloques.push({
                                delDia: agendaDeHoy ? (bloque.restantesDelDia as number) +
                                    (bloque.restantesProgramados as number) +
                                    (bloque.restantesProfesional as number) +
                                    (bloque.restantesGestion as number) : bloque.restantesDelDia,
                                programado: agendaDeHoy ? 0 : bloque.restantesProgramados,
                                gestion: agendaDeHoy ? 0 : bloque.restantesGestion,
                                profesional: agendaDeHoy ? 0 : bloque.restantesProfesional
                            });
                            bloque.turnos.forEach((turno) => {
                                if (turno.estado === 'turnoDoble' && turnoAnterior) {
                                    turno = turnoAnterior;
                                }
                                // Si el turno está disponible pero ya paso la hora
                                if (agendaDeHoy && turno.estado === 'disponible' && turno.horaInicio < this.hoy) {
                                    countBloques[indexBloque].delDia--;
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
                        }
                        if (!agendaDeHoy && this.agenda.estado === 'publicada') {
                            (this.programadosDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                        }

                        if (!agendaDeHoy && this.agenda.estado === 'disponible') {
                            (this.gestionDisponibles > 0 || this.profesionalDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
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
            this.habilitarTurnoDoble();
            this.estadoT = 'confirmacion';
        } else {
            this.plex.info('warning', 'Debe seleccionar un paciente');
        }
    }

    seleccionarBusqueda(indice: number) {
        // console.log("busquedas ", this.busquedas);
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
        this.opciones.profesional = turno.profesionales;
        if (!actualizarProfesional && this.eventoProfesional) {
            this.eventoProfesional.callback(this.opciones.profesional);
        }
        this.actualizar('');
    }

    seleccionarAlternativa(indice: number) {
        this.seleccionarAgenda(this.alternativas[indice]);
    }

    seleccionarLlave(indice: number) {
        if (this.llaves[indice].solicitudVigente) {
            this.opciones.tipoPrestacion = this.llaves[indice].tipoPrestacion;
            this.actualizar('');
        } else {
            this.plex.info('alert', 'Esta solicitud ha vencido y el profesional debe solicitarla nuevamente');
        }
    }

    verAgenda(direccion: String) {
        if (this.agendas) {
            // Asegurar que no nos salimos del rango de agendas (agendas.length)
            let enRango = direccion === 'der' ? ((this.indice + 1) < this.agendas.length) : ((this.indice - 1) >= 0);
            if (enRango) {
                if (direccion === 'der') {
                    this.indice++;
                } else {
                    this.indice--;
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

    obtenerCarpetaPaciente(paciente) {
        // Se busca el número de carpeta de la Historia Clínica en papel del paciente
        // a partir del documento y del efector

        // Verifico que tenga nro de carpeta de Historia clínica en el efector
        if (this.paciente.carpetaEfectores && this.paciente.carpetaEfectores.length > 0) {
            this.carpetaEfector = this.paciente.carpetaEfectores.find((data) => {
                return (data.organizacion.id === this.auth.organizacion.id);
            });
        }

        if (!this.paciente.carpetaEfectores || !(this.carpetaEfector.nroCarpeta)) {
            let params = {
                documento: this.paciente.documento,
                organizacion: this.auth.organizacion._id
            };

            this.servicePaciente.getNroCarpeta(params).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    // Se actualiza la carpeta del Efector correspondiente
                    this.carpetaEfector = {
                        organizacion: carpeta.organizacion,
                        nroCarpeta: carpeta.nroCarpeta
                    };
                }
            });

        }

    }

    actualizarCarpetaPaciente(paciente) {
        // Se realiza un patch del paciente
        let listaCarpetas = [];
        listaCarpetas = paciente.carpetaEfectores;
        let carpetaActualizar = listaCarpetas.find(carpeta => carpeta.organizacion.id === this.auth.organizacion.id);
        if (!carpetaActualizar) {
            listaCarpetas.push(this.carpetaEfector);
        } else {
            listaCarpetas.forEach(carpeta => {
                if (carpeta.organizacion._id === this.auth.organizacion.id) {
                    carpeta.nroCarpeta = this.carpetaEfector.nroCarpeta;
                }
            });
        }
        let cambios = {
            'op': 'updateCarpetaEfectores',
            'carpetaEfectores': listaCarpetas
        };
        this.servicePaciente.patch(paciente.id, cambios).subscribe(resultado => {
            if (resultado) {
                this.plex.toast('info', 'La información de la carpeta del paciente fue actualizada');
            }
        });
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
        });
        this.ultimosTurnos = ultimosTurnos;
    }

    /**
     * DAR TURNO
     */
    darTurno() {
        // Ver si cambió el estado de la agenda desde otro lado
        this.serviceAgenda.getById(this.agenda.id).subscribe(a => {

            if (a.estado !== 'disponible' && a.estado !== 'publicada') {

                this.plex.info('warning', 'Esta agenda ya no está disponible.');
                this.actualizar('sinFiltro');
                return false;

            } else {

                let estado: String = 'asignado';

                let pacienteSave = {
                    id: this.paciente.id,
                    documento: this.paciente.documento,
                    apellido: this.paciente.apellido,
                    nombre: this.paciente.nombre,
                    telefono: this.telefono,
                    carpetaEfectores: this.paciente.carpetaEfectores
                };

                this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
                this.agenda.bloques[this.indiceBloque].cantidadTurnos = Number(this.agenda.bloques[this.indiceBloque].cantidadTurnos) - 1;
                let turnoSiguiente = this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno + 1];
                let agendaid = this.agenda.id;

                // Datos del Turno
                let datosTurno = {
                    idAgenda: this.agenda.id,
                    idTurno: this.turno.id,
                    idBloque: this.bloque.id,
                    paciente: pacienteSave,
                    tipoPrestacion: this.turnoTipoPrestacion,
                    tipoTurno: this.tiposTurnosSelect
                };

                // let operacion: Observable<any>;
                this.serviceTurno.save(datosTurno).subscribe(resultado => {
                    this.estadoT = 'noSeleccionada';
                    this.agenda = null;
                    this.actualizar('sinFiltro');
                    this.plex.toast('info', 'El turno se asignó correctamente');

                    // Enviar SMS sólo en Producción
                    if (environment.production === true) {
                        let dia = moment(this.turno.horaInicio).format('DD/MM/YYYY');
                        let horario = moment(this.turno.horaInicio).format('HH:mm');
                        let mensaje = 'Usted tiene un turno el dia ' + dia + ' a las ' + horario + ' hs. para ' + this.turnoTipoPrestacion.nombre;
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
                            // Se seteó el id del turno en la solicitud
                            console.log('Se seteó el id del turno en la solicitud', prestacion);

                        });
                    }


                    if (this.turnoDoble) {
                        if (turnoSiguiente.estado === 'disponible') {
                            let patch: any = {
                                op: 'darTurnoDoble',
                                turnos: [turnoSiguiente]
                            };
                            // Patchea el turno doble
                            this.serviceAgenda.patchMultiple(agendaid, patch).subscribe((agendaActualizada) => {
                                if (agendaActualizada) {
                                    this.plex.toast('info', 'Se asignó un turno doble');
                                }
                            });
                        }
                    }
                    this.actualizarCarpetaPaciente(this.paciente);
                });

                // Si cambió el teléfono lo actualizo en el MPI
                if (this.cambioTelefono) {
                    let nuevoCel = {
                        'tipo': 'celular',
                        'valor': this.telefono,
                        'ranking': 1,
                        'activo': true,
                        'ultimaActualizacion': new Date()
                    };
                    let mpi: Observable<any>;
                    let flagTelefono = false;
                    // Si tiene un celular en ranking 1 y activo cargado, se reemplaza el nro
                    // sino, se genera un nuevo contacto
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
                    let cambios = {
                        'op': 'updateContactos',
                        'contacto': this.paciente.contacto
                    };
                    mpi = this.servicePaciente.patch(pacienteSave.id, cambios);
                    mpi.subscribe(resultado => {
                        if (resultado) {
                            this.plex.toast('info', 'Número de teléfono actualizado');
                        }
                    });

                }
            };
        });

        if (this.paciente && this._pacienteSeleccionado) {
            this.cancelarDarTurno.emit(true);
            return false;
        } else {
            this.buscarPaciente();
        }
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
                    this.plex.toast('info', 'Se envió SMS al paciente ' + paciente.nombreCompleto);
                } else {
                    this.plex.toast('danger', 'ERROR: SMS no enviado');
                }
            },
            err => {
                if (err) {
                    this.plex.toast('danger', 'ERROR: Servicio caído');

                }
            });
    }

    buscarPaciente() {
        this.showDarTurnos = false;
        this.pacientesSearch = true;
    }

    public tieneTurnos(bloque: IBloque): boolean {
        let turnos = bloque.turnos;
        return turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy) != null;
    }

    afterCreateUpdate(paciente) {
        this.showCreateUpdate = false;
        this.showDarTurnos = true;
        if (paciente) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.verificarTelefono(pacienteMPI);
                    this.obtenerCarpetaPaciente(this.paciente);
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
                    // this.showDarTurnos = true;
                    this.verificarTelefono(this.paciente);
                    window.setTimeout(() => this.pacientesSearch = false, 100);
                    this.obtenerCarpetaPaciente(this.paciente);
                    this.getUltimosTurnos();
                });
        } else {
            this.seleccion = paciente;
            // this.verificarTelefono(this.seleccion);
            this.esEscaneado = true;
            this.escaneado.emit(this.esEscaneado);
            this.selected.emit(this.seleccion);
            // this.pacientesSearch = false;
            // this.showCreateUpdate = true;
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
    }

    cancelar() {
        this.showDarTurnos = false;
        this.volverAlGestor.emit(true);
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}
