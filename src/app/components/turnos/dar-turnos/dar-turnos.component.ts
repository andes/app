type Estado = 'seleccionada' | 'noSeleccionada' | 'confirmacion' | 'noTurnos';

import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TurnoService } from './../../../services/turnos/turno.service';
import { Observable } from 'rxjs/Rx';
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IListaEspera } from './../../../interfaces/turnos/IListaEspera';
import { Component, AfterViewInit, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
moment.locale('en');

// Servicios
import { PacienteService } from '../../../services/paciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
const size = 4;

@Component({
    selector: 'dar-turnos',
    templateUrl: 'dar-turnos.html'
})

export class DarTurnosComponent implements OnInit {
    private _reasignaTurnos: any;

    @Input('reasignar')
    set reasignar(value: any) {
        this._reasignaTurnos = value;
    }
    get reasignar(): any {
        return this._reasignaTurnos;
    }

    public agenda: IAgenda;
    public agendas: IAgenda[];
    public opciones = {
        fecha: new Date(),
        tipoPrestacion: null,
        profesional: null,
    };

    paciente: IPaciente;
    public estadoT: Estado;
    private turno: ITurno;
    private bloque: IBloque;
    private bloques: IBloque[];
    private indiceTurno: number;
    private indiceBloque: number;
    private telefono: String = '';
    private busquedas: any[] = localStorage.getItem('busquedas') ? JSON.parse(localStorage.getItem('busquedas')) : [];
    private alternativas: any[] = [];
    private reqfiltros = false;
    private tipoPrestaciones: String = '';
    private tipoPrestacionesArray: Object[];
    private turnoTipoPrestacion: any = {};
    countBloques: any[];
    countTurnos: any = {};

    ultimosTurnos: any[];

    indice: number = -1;
    semana: String[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    public permisos = [];
    public autorizado = false;
    pacientesSearch = true;
    showDarTurnos = false;
    cambioTelefono = false;

    tipoTurno: string;
    tiposTurnosSelect: String;

    constructor(
        public serviceProfesional: ProfesionalService,
        public serviceAgenda: AgendaService,
        public serviceListaEspera: ListaEsperaService,
        public serviceTurno: TurnoService,
        public servicePaciente: PacienteService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public plex: Plex,
        public auth: Auth) { }

    ngOnInit() {

        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        console.log('Autorizado: ', this.autorizado);

        if (this._reasignaTurnos) {
            this.paciente = this._reasignaTurnos.paciente;
            this.telefono = this.turno.paciente.telefono;
        }

        // Fresh start
        // En este punto debería tener paciente ya seleccionado
        this.actualizar('sinFiltro');

    }

    loadTipoPrestaciones(event) {
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        console.log('PERMISOS TIPOPRESTACIONES: ', this.permisos);
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; }); event.callback(dataF);
        });
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    filtrar() {
        let search = {
            'tipoPrestacion': this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion : null,
            'profesional': this.opciones.profesional ? this.opciones.profesional : null
        };
        if (this.busquedas.length === size) {
            this.busquedas.shift();
        }
        this.busquedas.push(search);

        localStorage.setItem('busquedas', JSON.stringify(this.busquedas));

        this.actualizar('');
    }

    /**
     *
     * @param etiqueta: define qué filtros usar para traer todas las Agendas
     */
    actualizar(etiqueta) {

        // 1) Auth general (si puede ver esta pantalla)
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

        // 2) Permisos
        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        // this.permisos = this.auth.getPermissions('turnos:darTurnos:organizacion:?');
        console.log('PERMISOS: ', this.permisos);

        let params: any = {};
        this.estadoT = 'noSeleccionada';
        this.agenda = null;


        if (etiqueta !== 'sinFiltro') {

            // Filtro búsqueda
            params = {
                idTipoPrestacion: (this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : ''),
                idProfesional: (this.opciones.profesional ? this.opciones.profesional.id : '')
            };

        } else {

            // Reseteat opciones
            this.opciones.tipoPrestacion = null;
            this.opciones.profesional = null;

            params = {
                // Mostrar sólo las agendas a partir de hoy en adelante
                fechaDesde: new Date().setHours(0, 0, 0, 0),
                tipoPrestaciones: this.permisos,
                // Mostrar solo las agendas que correspondan a la organización del usuario logueado
                organizacion: this.auth.organizacion._id
            };

        }

        console.log('params:', params);
        // Traer las agendas
        this.serviceAgenda.get(params).subscribe(agendas => {

            // Sólo traer agendas disponibles o publicadas
            this.agendas = agendas.filter((data) => {
                return (data.estado === 'Disponible' || data.estado === 'Publicada');
            });


            // Evaluamos c/ agenda para ver si tienen fecha de hoy
            this.agendas.forEach((agenda, indexAgenda) => {
                // En caso de tener fecha de hoy, los turnos deben pasar a ser de tipo: delDia
                if (agenda.horaInicio >= moment(new Date()).startOf('day').toDate() && agenda.horaInicio <= moment(new Date()).endOf('day').toDate()) {
                    agenda.bloques.forEach((bloque, indexBloque) => {
                        bloque.turnos.forEach((turno, indexTurno) => {
                            turno.tipoTurno = 'delDia';
                        });
                    });
                }
            });

            this.indice = -1;

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

        // Actualiza el calendario, para ver si no ho hubo cambios
        this.actualizar('sinFiltro');

        // Asigno agenda
        this.agenda = agenda;

        // Ver si cambió el estado de la agenda en otro lado
        this.serviceAgenda.getById(this.agenda.id).subscribe(a => {

            // Si cambió el estado y ya no está Disponible ni Publicada, mostrar un alerta y cancelar cualquier operación
            if (a.estado !== 'Disponible' && a.estado !== 'Publicada') {

                this.plex.alert('Esta agenda ya no está disponible.');
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

                    let idAgendas = this.agendas.map(elem => { return elem.id; });
                    this.indice = idAgendas.indexOf(this.agenda.id);

                    /*Si hay turnos disponibles para la agenda, se muestra en el panel derecho*/

                    if (this.agenda.turnosDisponibles > 0) {
                        if (this.agenda.estado === 'Disponible') {
                            this.tiposTurnosSelect = 'gestion';
                        }
                        if (this.agenda.estado === 'Publicada') {
                            this.tiposTurnosSelect = 'programado';
                        }
                        let countBloques = [];
                        let programadosDisponibles = 0;
                        let gestionDisponibles = 0;
                        let delDiaDisponibles = 0;
                        // let tiposTurnosSelect = [];

                        // Si la agenda es de hoy, los turnos deberán sumarse  al contador "delDia"
                        if (this.agenda.horaInicio >= moment(new Date()).startOf('day').toDate()
                            && this.agenda.horaInicio <= moment(new Date()).endOf('day').toDate()) {
                            isDelDia = true;
                            this.tiposTurnosSelect = 'del dia';
                            // recorro los bloques y cuento  los turnos como 'del dia', luego descuento los ya asignados
                            this.agenda.bloques.forEach((bloque, indexBloque) => {
                                countBloques.push({
                                    delDia: bloque.cantidadTurnos,
                                    programado: 0,
                                    gestion: 0,
                                });
                                bloque.turnos.forEach((turno) => {
                                    if (turno.estado === 'asignado') {
                                        countBloques[indexBloque].delDia--;
                                    }
                                });
                                delDiaDisponibles = + countBloques[indexBloque].delDia;
                            });
                            if (this.agenda.estado === 'Publicada') {
                                (delDiaDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
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
                                    if (turno.estado === 'asignado') {
                                        switch (turno.tipoTurno) {
                                            case ('programado'):
                                                countBloques[indexBloque].programado--;
                                                break;
                                            case ('profesional'):
                                                countBloques[indexBloque].profesional--;
                                                break;
                                            case ('gestion'):
                                                countBloques[indexBloque].gestion--;
                                                break;
                                        }
                                    }
                                });
                                programadosDisponibles = + countBloques[indexBloque].programado;
                                gestionDisponibles = + countBloques[indexBloque].gestion;
                            });
                            if (this.agenda.estado === 'Disponible') {
                                (gestionDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                            }
                            if (this.agenda.estado === 'Publicada') {
                                (programadosDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                            }
                        }
                        // contador de turnos por Bloque
                        this.countBloques = countBloques;

                        this.tipoPrestaciones = '';

                        let tipoPrestacionesArray = [];

                        if (this.agenda.tipoPrestaciones.length > 1) {
                            this.agenda.tipoPrestaciones.forEach((cadaprestacion, ind) => {
                                this.tipoPrestaciones = this.tipoPrestaciones ? this.tipoPrestaciones + '\n' + cadaprestacion.nombre : cadaprestacion.nombre;
                                tipoPrestacionesArray.push({ nombre: cadaprestacion.nombre });
                            });
                        } else {
                            this.tipoPrestaciones = this.agenda.tipoPrestaciones[0].nombre;
                            this.turnoTipoPrestacion = this.agenda.tipoPrestaciones[0];
                            tipoPrestacionesArray.push({ nombre: this.agenda.tipoPrestaciones[0].nombre });
                        }
                        this.tipoPrestacionesArray = tipoPrestacionesArray;
                    } else {

                        /*Si no hay turnos disponibles, se muestran alternativas (para eso deben haber seteado algún filtro)*/
                        this.estadoT = 'noTurnos';
                        if (this.opciones.tipoPrestacion || this.opciones.profesional) {
                            this.serviceAgenda.get({
                                'fechaDesde': moment(this.agenda.horaInicio).add(1, 'day').toDate(),
                                'idTipoPrestacion': this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : null,
                                'idProfesional': this.opciones.profesional ? this.opciones.profesional.id : null,
                            }).subscribe(alternativas => { this.alternativas = alternativas; this.reqfiltros = false; });
                        } else {
                            this.reqfiltros = true;
                        }
                    }
                }
            }
        });
    }

    seleccionarTurno(bloque: any, indice: number) {
        if (this.paciente) {
            this.bloque = bloque;

            this.indiceBloque = this.agenda.bloques.indexOf(this.bloque);
            this.indiceTurno = indice;
            this.turno = bloque.turnos[indice];
            if (this.bloque.tipoPrestaciones.length === 1) {
                this.turno.tipoPrestacion = this.bloque.tipoPrestaciones[0];
            }
            this.estadoT = 'confirmacion';
        } else {
            this.plex.alert('Seleccione un paciente');
        }
    }

    seleccionarBusqueda(indice: number) {
        this.opciones.tipoPrestacion = this.busquedas[indice].tipoPrestacion;
        this.opciones.profesional = this.busquedas[indice].profesional;
        this.actualizar('');
    }

    seleccionarAlternativa(indice: number) {
        this.seleccionarAgenda(this.alternativas[indice]);
    }

    verAgenda(suma: boolean) {
        if (this.agendas) {
            let condiciones = suma ? ((this.indice + 1) < this.agendas.length) : ((this.indice - 1) >= 0);
            if (condiciones) {
                if (suma) {
                    this.indice++;
                } else {
                    this.indice--;
                }
                this.agenda = this.agendas[this.indice];
            }
        }
        this.seleccionarAgenda(this.agenda);
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
                                    tipoPrestacion: turno.tipoPrestacion.nombre,
                                    horaInicio: moment(turno.horaInicio).format('L'),
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
        console.log('ULTIMOS TURNOS', ultimosTurnos);
        this.ultimosTurnos = ultimosTurnos;
    }

    /**
     *
     */
    onSave() {

        // Ver si cambió el estado de la agenda desde otro lado
        this.serviceAgenda.getById(this.agenda.id).subscribe(a => {

            if (a.estado !== 'Disponible' && a.estado !== 'Publicada') {

                this.plex.alert('Esta agenda ya no está disponible.');
                this.actualizar('sinFiltro');
                return false;

            } else {

                let estado: String = 'asignado';

                let pacienteSave = {
                    id: this.paciente.id,
                    documento: this.paciente.documento,
                    apellido: this.paciente.apellido,
                    nombre: this.paciente.nombre,
                    telefono: this.telefono
                };

                this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
                this.agenda.bloques[this.indiceBloque].cantidadTurnos = Number(this.agenda.bloques[this.indiceBloque].cantidadTurnos) - 1;

                let datosTurno = {
                    idAgenda: this.agenda.id,
                    idTurno: this.turno.id,
                    idBloque: this.bloque.id,
                    paciente: pacienteSave,
                    tipoPrestacion: this.turnoTipoPrestacion,
                    tipoTurno: this.tiposTurnosSelect
                };

                let operacion: Observable<any>;
                operacion = this.serviceTurno.save(datosTurno);
                operacion.subscribe(resultado => {
                    this.estadoT = 'noSeleccionada';
                    this.agenda = null;
                    this.actualizar('sinFiltro');
                    this.borrarTurnoAnterior();
                    this.plex.alert('El turno se asignó correctamente');
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
                    console.log(this.paciente.contacto);
                    let cambios = {
                        'op': 'updateContactos',
                        'contacto': this.paciente.contacto
                    };
                    mpi = this.servicePaciente.patch(pacienteSave.id, cambios);
                    mpi.subscribe(resultado => {
                        this.plex.alert('Se actualizó el numero de telefono');
                    });
                }
            }
        });
       this.buscarPaciente();
    }

    borrarTurnoAnterior() {
        if (this._reasignaTurnos) {
            let patch = {
                'op': 'reasignarTurno',
                'idAgenda': this._reasignaTurnos.idAgenda,
                'idTurno': this._reasignaTurnos.idTurno
            };

            this.serviceAgenda.patch(this._reasignaTurnos.idAgenda, patch).subscribe();
        }
    }

    buscarPaciente() {
        this.showDarTurnos = false;
        this.pacientesSearch = true;
    }

    public tieneTurnos(bloque: IBloque): boolean {
        let turnos = bloque.turnos;
        if (turnos.find(turno => turno.estado === 'disponible')) {
            return true;
        } else {
            return false;
        }
    }

    onReturn(pacientes: IPaciente): void {
        this.paciente = pacientes;
        // se busca entre los contactos si tiene un celular en ranking 1
        if (this.paciente.contacto.length > 0) {
            this.paciente.contacto.forEach((contacto) => {
                if (contacto.tipo === 'celular') {
                    this.telefono = contacto.valor;
                }
            });
        }
        this.showDarTurnos = true;
        this.pacientesSearch = false;
        window.setTimeout(() => this.pacientesSearch = false, 100);
        this.getUltimosTurnos();
    }

    onCancel() {
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
        this.buscarPaciente();
    }
}
