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
        // console.log('busquedas ', this.busquedas);

        this.hoy = new Date();
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.opciones.fecha = moment().toDate();
        // this.opciones.tipoPrestacion = this._solicitudPrestacion.solicitud.registros[0].concepto;

        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        if (this._pacienteSeleccionado) {
            this.paciente = this._pacienteSeleccionado;
            this.pacientesSearch = false;
            this.showDarTurnos = true;
            // this.actualizarCarpetaPaciente(this.paciente);
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
            }
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
                    return (data.estado === 'disponible' || data.estado === 'publicada');
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

                // Asigno bloques
                this.bloques = this.agenda.bloques;

                // Iniciar alternativas (para cuando los turnos están completos)
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

                // hay agenda?
                if (this.agenda) {

                    let myBloques = [];
                    let isDelDia = false;

                    let idAgendas = this.agendas.map(elem => {
                        return elem.id;
                    });

                    this.indice = idAgendas.indexOf(this.agenda.id);

                    // Usamos CalendarioDia para hacer chequeos
                    // TODO: Cleanup y usar sólo la clase donde se pueda
                    let cal = new CalendarioDia(null, this.agenda, this._solicitudPrestacion);

                    /*Si hay turnos disponibles para la agenda, se muestra en el panel derecho*/
                    if (cal.estado !== 'ocupado') {

                        // Tiene solicitud "papelito"?
                        if (this._solicitudPrestacion) {

                            // Es autocitado?
                            if (this._solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true) {
                                this.tiposTurnosSelect = 'profesional';
                                this.tiposTurnosLabel = 'Para Profesional';
                            } else {
                                this.tiposTurnosSelect = 'gestion';
                                this.tiposTurnosLabel = 'Con llave';
                            }
                        } else {
                            if (this.agenda.estado === 'disponible') {
                                this.tiposTurnosSelect = 'gestion';
                                this.tiposTurnosLabel = 'Para gestión de pacientes';
                            }

                            if (this.agenda.estado === 'publicada') {
                                this.tiposTurnosSelect = 'programado';
                                this.tiposTurnosLabel = 'Programado';
                            }
                        }

                        let countBloques = [];
                        this.programadosDisponibles = 0;
                        this.gestionDisponibles = 0;
                        this.delDiaDisponibles = 0;
                        this.profesionalDisponibles = 0;
                        // let tiposTurnosSelect = [];

                        // Si la agenda es de hoy, los turnos deberán sumarse al contador "delDia"
                        if (this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate()) {

                            isDelDia = true;
                            this.tiposTurnosSelect = 'delDia';
                            this.tiposTurnosLabel = 'Del día';
                            // Recorro los bloques y cuento los turnos programados como "delDia", luego descuento los ya asignados
                            this.agenda.bloques.forEach((bloque, indexBloque) => {

                                countBloques.push({
                                    delDia: ((bloque.accesoDirectoDelDia as number) + (bloque.accesoDirectoProgramado as number)),
                                    programado: 0,
                                    gestion: bloque.reservadoGestion,
                                    profesional: bloque.reservadoProfesional
                                });
                                bloque.turnos.forEach((turno) => {
                                    // Si el turno está asignado o está disponible pero ya paso la hora
                                    if (turno.estado === 'asignado' || (turno.estado === 'turnoDoble') || (turno.estado === 'disponible' && turno.horaInicio < this.hoy)) {
                                        if (turno.estado === 'turnoDoble' && turnoAnterior) {
                                            turno = turnoAnterior;
                                        }
                                        switch (turno.tipoTurno) {
                                            case ('delDia'):
                                                countBloques[indexBloque].delDia--;
                                                break;
                                            case ('programado'):
                                                countBloques[indexBloque].delDia--;
                                                break;
                                            case ('profesional'):
                                                countBloques[indexBloque].profesional--;
                                                break;
                                            case ('gestion'):
                                                countBloques[indexBloque].gestion--;
                                                break;
                                            default:
                                                this.delDiaDisponibles--;
                                                break;
                                        }
                                    }

                                    turnoAnterior = turno;

                                });
                                this.delDiaDisponibles = this.delDiaDisponibles + countBloques[indexBloque].delDia;
                            });
                            if (this.agenda.estado === 'publicada') {
                                this.estadoT = (this.delDiaDisponibles > 0) ? 'seleccionada' : 'noTurnos';
                            }

                        } else {
                            // En caso contrario, se calculan  los contadores por separado
                            this.agenda.bloques.forEach((bloque, indexBloque) => {
                                countBloques.push({
                                    // Asignamos a contadores dinamicos la cantidad inicial de c/u
                                    // de los tipos de turno respectivamente
                                    delDia: bloque.accesoDirectoDelDia,
                                    programado: bloque.accesoDirectoProgramado,
                                    gestion: bloque.reservadoGestion,
                                    profesional: bloque.reservadoProfesional
                                });

                                bloque.turnos.forEach((turno) => {
                                    if (turno.estado === 'asignado' || (turno.estado === 'turnoDoble')) {
                                        if (turno.estado === 'turnoDoble' && turnoAnterior) {
                                            turno = turnoAnterior;
                                        }
                                        switch (turno.tipoTurno) {
                                            case ('delDia'):
                                                countBloques[indexBloque].delDia--;
                                                break;
                                            case ('programado'):
                                                countBloques[indexBloque].programado--;
                                                break;
                                            case ('profesional'):
                                                if (this.agenda.estado === 'disponible') {
                                                    countBloques[indexBloque].profesional--;
                                                }
                                                break;
                                            case ('gestion'):
                                                if (this.agenda.estado === 'disponible') {
                                                    countBloques[indexBloque].gestion--;
                                                }
                                                break;
                                        }
                                    }
                                    turnoAnterior = turno;
                                });

                                this.delDiaDisponibles = countBloques[indexBloque].delDia;
                                this.programadosDisponibles += countBloques[indexBloque].programado;
                                this.gestionDisponibles += countBloques[indexBloque].gestion;
                                this.profesionalDisponibles += countBloques[indexBloque].profesional;
                            });

                            if (this.agenda.estado === 'disponible') {
                                (this.gestionDisponibles > 0 || this.profesionalDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                            }
                            if (this.agenda.estado === 'publicada') {
                                (this.programadosDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                            }
                        }
                        // contador de turnos por Bloque
                        this.countBloques = countBloques;

                        // if (this.agenda.tipoPrestaciones.length <= 1) {
                        //   this.turnoTipoPrestacion = this.agenda.tipoPrestaciones[0];
                        // }
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

    actualizarCarpetaPaciente(pacienteActualizar) {
        // Se busca el número de carpeta de la Historia Clínica del paciente
        // a partir del documento y del efector
        let carpetaEfector = null;
        let listaCarpetas = [];
        // Verifico que tenga nro de carpeta de Historia clínica en el efector
        if (this.paciente.carpetaEfectores && this.paciente.carpetaEfectores.length > 0) {
            carpetaEfector = this.paciente.carpetaEfectores.find((data) => {
                return (data.organizacion.id === this.auth.organizacion.id);
            });
            listaCarpetas = this.paciente.carpetaEfectores;
        }

        if (!this.paciente.carpetaEfectores || !carpetaEfector) {
            let params = {
                documento: this.paciente.documento,
                organizacion: this.auth.organizacion._id
            };

            this.servicePaciente.getNroCarpeta(params).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    // Se actualiza la carpeta del Efector correspondiente, se realiza un patch del paciente
                    let nuevaCarpeta = {
                        organizacion: carpeta.organizacion,
                        nroCarpeta: carpeta.nroCarpeta
                    };
                    listaCarpetas.push(nuevaCarpeta);
                    let cambios = {
                        'op': 'updateCarpetaEfectores',
                        'carpetaEfectores': listaCarpetas
                    };
                    this.servicePaciente.patch(pacienteActualizar.id, cambios).subscribe(resultado => {
                        if (resultado) {
                            this.plex.toast('info', 'La información de la carpeta del paciente fue actualizada');
                        }
                    });

                }
            });

        }

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

                    // Enviar SMS
                    // let dia = moment(this.turno.horaInicio).format('DD/MM/YYYY');
                    // let tm = moment(this.turno.horaInicio).format('HH:mm');
                    // let mensaje = 'Usted tiene un turno el dia ' + dia + ' a las ' + tm + ' hs. para ' + this.turnoTipoPrestacion.nombre;
                    // this.enviarSMS(pacienteSave, mensaje);

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
                    // this.actualizarCarpetaPaciente(pacienteSave);
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
                // this.smsLoader = false;
                // if (resultado === '0') {
                //     this.turnosSeleccionados[x].smsEnviado = true;
                // } else {
                //     this.turnosSeleccionados[x].smsEnviado = false;
                // }
            },
            err => {
                if (err) {
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
