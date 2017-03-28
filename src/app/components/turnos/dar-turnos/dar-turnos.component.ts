import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
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
import { PrestacionService } from '../../../services/turnos/prestacion.service';
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


    public estadoT: Estado;
    private turno: ITurno;
    private bloque: IBloque;
    private bloques: IBloque[];
    private indiceTurno: number;
    private indiceBloque: number;
    private telefono: String = '';
    private busquedas: any[] = localStorage.getItem('busquedas') ? JSON.parse(localStorage.getItem('busquedas')) : [];
    private alternativas: any[] = [];
    private reqfiltros: boolean = false;
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

    // Este paciente hay que reemplazarlo por el que viene de la búsqueda
    // paciente: IPaciente;

    paciente: any = {
        id: '57f66f2076e97c2d18f1808b',
        documento: '30403872',
        apellido: 'Diego',
        nombre: 'Pérez',
        contacto: [{
            tipo: 'Teléfono Fijo',
            valor: '2995573273',
            ranking: 1,
            activo: true
        }]
    };

    pacientesSearch = false;
    showDarTurnos = true;
    cambioTelefono = false;
    infoPaciente = true;

    tipoTurno: string;
    // tiposTurnosSelect: any[];
    tiposTurnosSelect: String;

    constructor(public servicioPrestacion: PrestacionService,
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

        if (this._reasignaTurnos) {
            this.paciente = this._reasignaTurnos.paciente;
            this.telefono = this.paciente.telefono;
        }

        // Fresh start
        // En este punto debería tener paciente ya seleccionado
        this.actualizar('sinFiltro');
        this.getUltimosTurnos();

    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe(event.callback);
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

        console.log(this.permisos);

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

            // Mostrar sólo las agendas a partir de hoy en adelante
            params = {
                fechaDesde: new Date().setHours(0, 0, 0, 0)
                // tipoPrestacion: this.permisos
            };

        }

        // Traer las agendas
        this.serviceAgenda.get(params).subscribe(agendas => {

            // Sólo traer agendas disponibles o publicadas
            this.agendas = agendas.filter((data) => {
                return (data.estado === 'Disponible' || data.estado === 'Publicada');
            });


            // El siguiente codigo se reemplazó en el bloque de abajo, cambia el lugar de la condición
            // no borro por las dudas

            // Loop agendas / bloques / turnos
            // this.agendas.forEach((agenda, indexAgenda) => {
            //     agenda.bloques.forEach((bloque, indexBloque) => {
            //         bloque.turnos.forEach((turno, indexTurno) => {
            //             if (turno.horaInicio >= moment(new Date()).startOf('day').toDate() && turno.horaInicio <= moment(new Date()).endOf('day').toDate()) {
            //                 turno.tipoTurno = 'delDia';
            //             }
            //         });
            //     });
            // });


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

                    this.indice = this.agendas.indexOf(this.agenda);

                    /*Si hay turnos disponibles para la agenda, se muestra en el panel derecho*/

                    if (this.agenda.turnosDisponibles > 0) {
                        debugger
                        if (this.agenda.estado === 'Disponible') {
                            this.tiposTurnosSelect = 'gestion';
                        }
                        if (this.agenda.estado === 'Publicada') {
                            this.tiposTurnosSelect = 'programado';
                        }
                        debugger;
                        let countBloques = [];
                        let programadosDisponibles = 0;
                        let gestionDisponibles = 0;
                        // let tiposTurnosSelect = [];

                        // Si la agenda es de hoy, los turnos deberán sumarse  al contador "delDia"
                        if (this.agenda.horaInicio >= moment(new Date()).startOf('day').toDate()
                            && this.agenda.horaInicio <= moment(new Date()).endOf('day').toDate()) {
                            this.tiposTurnosSelect = 'del dia';
                            // recorro los bloques y cuento  los turnos como 'del dia', luego descuento los ya asignados
                            this.agenda.bloques.forEach((bloque, indexBloque) => {
                                debugger;
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
                            });

                        } else {
                            // En caso contrario, se calculan  los contadores por separado
                            // loopear turnos para sacar el tipo de turno!
                            this.agenda.bloques.forEach((bloque, indexBloque) => {
                                debugger;
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
                                        switch (this.tiposTurnosSelect) {
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
                        }
                        // contador de turnos por Bloque
                        this.countBloques = countBloques;
                        debugger;

                        // this.tiposTurnosSelect = tiposTurnosSelect.filter(function (item, pos, self) {
                        //     return self.indexOf(item) === pos;
                        // });
                        if (this.agenda.estado === 'Disponible') {
                            (gestionDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                        }
                        if (this.agenda.estado === 'Publicada') {
                            (programadosDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
                        }

                        // this.estadoT = 'seleccionada';
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
        debugger;
        let ultimosTurnos = [];
        this.serviceAgenda.find(this.paciente.id).subscribe(agendas => {
            console.log('AGENDAS', agendas)
            debugger;
            agendas.forEach((agenda, indexAgenda) => {
                debugger;
                agenda.bloques.forEach((bloque, indexBloque) => {
                    debugger;
                    bloque.turnos.forEach((turno, indexTurno) => {
                        if (turno.paciente) {
                            if (turno.paciente.id === this.paciente.id) {
                                ultimosTurnos.push({
                                    tipoPrestacion: turno.tipoPrestacion.nombre,
                                    horaInicio: moment(turno.horaInicio).format('L'),
                                    organizacion: agenda.organizacion.nombre
                                });

                            }
                        }
                        debugger;
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
                    telefono: this.paciente.telefono
                };

                this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
                this.agenda.bloques[this.indiceBloque].cantidadTurnos = Number(this.agenda.bloques[this.indiceBloque].cantidadTurnos) - 1;

                // this.countBloques[this.indiceBloque][String()]

                let datosTurno = {
                    idAgenda: this.agenda.id,
                    idTurno: this.turno.id,
                    idBloque: this.bloque.id,
                    paciente: pacienteSave,
                    tipoPrestacion: this.turnoTipoPrestacion,
                    tipoTurno: 'delDia'
                };

                let operacion: Observable<any>;
                debugger;
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
                    let mpi: Observable<any>;
                    let cambios = {
                        telefono: this.paciente.telefono
                    };
                    mpi = this.servicePaciente.patch(pacienteSave.id, cambios);
                    mpi.subscribe(resultado => {
                        this.plex.alert('Se actualizó el numero de telefono');
                    });
                }
            }
        });
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
        this.showDarTurnos = true;
        this.infoPaciente = true;
        window.setTimeout(() => this.pacientesSearch = false, 100);
    }

    onCancel() {
        let listaEspera: any;
        let operacion: Observable<IListaEspera>;
        let datosPrestacion = {
            id: this.opciones.tipoPrestacion.id,
            nombre: this.opciones.tipoPrestacion.nombre
        };
        let datosProfesional = !this.opciones.profesional ? null : {
            id: this.opciones.profesional.id,
            nombre: this.opciones.profesional.nombre,
            apellido: this.opciones.profesional.apellido
        };
        let datosPaciente = {
            id: this.paciente.id,
            nombre: this.paciente.nombre,
            apellido: this.paciente.apellido,
            documento: this.paciente.documento
        };
        listaEspera = {
            fecha: this.agenda.horaInicio,
            estado: 'Demanda Rechazada',
            tipoPrestacion: datosPrestacion,
            profesional: datosProfesional,
            paciente: datosPaciente,
        };
        operacion = this.serviceListaEspera.post(listaEspera);
        operacion.subscribe();
    }

}
