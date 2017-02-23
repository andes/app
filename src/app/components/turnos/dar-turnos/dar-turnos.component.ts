type Estado = 'seleccionada' | 'noSeleccionada' | 'confirmacion' | 'noTurnos'

import { Plex } from 'andes-plex/src/lib/core/service';
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
        prestacion: null,
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
    private prestaciones: String = '';
    private turnoPrestacion: any = {};
    indice: number = -1;
    semana: String[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];

    paciente: any = {
        id: '57f66f2076e97c2d18f1808b',
        documento: '30403872',
        apellido: 'Diego',
        nombre: 'Maradona',
        contacto: [{
            tipo: 'Teléfono Fijo',
            valor: '2995573273',
            ranking: 1,
            activo: true
        }]
    };

    debugger;
    pacientesSearch: boolean = false;
    showDarTurnos: boolean = true;
    cambioTelefono: boolean = false;

    ngOnInit() {
        if (this._reasignaTurnos) {
            this.paciente = this._reasignaTurnos.paciente;
            this.telefono = this.paciente.telefono;
        }

        this.actualizar('sinFiltro');
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get({}).subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    filtrar() {
        let search = {
            'prestacion': this.opciones.prestacion ? this.opciones.prestacion : null,
            'profesional': this.opciones.profesional ? this.opciones.profesional : null
        };
        if (this.busquedas.length === size) {
            this.busquedas.pop();
        }
        this.busquedas.push(search);
        localStorage.setItem('busquedas', JSON.stringify(this.busquedas));
        this.actualizar('');
    }

    actualizar(etiqueta) {
        let params: any = {};
        this.estadoT = 'noSeleccionada';
        this.agenda = null;
        if (etiqueta !== 'sinFiltro') {
            params = {
                'idPrestacion': this.opciones.prestacion ? this.opciones.prestacion.id : '',
                'idProfesional': this.opciones.profesional ? this.opciones.profesional.id : ''
            };
        } else {
            this.opciones.prestacion = null;
            this.opciones.profesional = null;
        }
        this.serviceAgenda.get(params).subscribe(agendas => {
            this.agendas = agendas; this.indice = -1;
            this.agendas.sort(
                function (a, b) {
                    return a.horaInicio.getTime() - b.horaInicio.getTime()
                        || b.turnosDisponibles - a.turnosDisponibles;
                }
            );
        });
    }

    seleccionarAgenda(agenda) {
        console.log('agenda ', agenda);
        this.agenda = agenda;
        this.bloques = this.agenda.bloques;
        this.alternativas = [];
        let prestacion: String = this.opciones.prestacion ? this.opciones.prestacion.id : '';
        /*Filtra los bloques segun el filtro prestacion*/
        this.bloques = this.agenda.bloques.filter(
            function (value) {
                let prestacionesBlq = value.prestaciones.map(function (obj) {
                    return obj.id;
                });
                if (prestacion) {
                    return (prestacionesBlq.indexOf(prestacion) >= 0);
                } else {
                    return true;
                }
            }
        );
        if (this.agenda) {
            this.indice = this.agendas.indexOf(this.agenda);

            /*Si hay turnos disponibles para la agenda, se muestra en el panel derecho*/
            if (this.agenda.turnosDisponibles > 0) {
                this.estadoT = 'seleccionada';
                this.prestaciones = '';
                if (this.agenda.prestaciones.length > 1) {
                    this.agenda.prestaciones.forEach((cadaprestacion, ind) => {
                        this.prestaciones = this.prestaciones ? this.prestaciones + '\n' + cadaprestacion.nombre : cadaprestacion.nombre;
                    });
                } else {
                    this.prestaciones = this.agenda.prestaciones[0].nombre;
                    this.turnoPrestacion = this.agenda.prestaciones[0];
                }
            } else {
                /*Si no hay turnos disponibles, se muestran alternativas (para eso deben haber seteado algún filtro)*/
                this.estadoT = 'noTurnos';
                if (this.opciones.prestacion || this.opciones.profesional) {
                    this.serviceAgenda.get({
                        'fechaDesde': moment(this.agenda.horaInicio).add(1, 'day').toDate(),
                        'idPrestacion': this.opciones.prestacion ? this.opciones.prestacion.id : null,
                        'idProfesional': this.opciones.profesional ? this.opciones.profesional.id : null,
                    }).subscribe(alternativas => { this.alternativas = alternativas; this.reqfiltros = false; });
                } else {
                    this.reqfiltros = true;
                }
            }
        }
    }

    seleccionarTurno(bloque: any, indice: number) {
        this.bloque = bloque;
        this.indiceBloque = this.agenda.bloques.indexOf(this.bloque);
        this.indiceTurno = indice;
        this.turno = bloque.turnos[indice];
        if (this.bloque.prestaciones.length === 1) {
            this.turno.prestacion = this.bloque.prestaciones[0];
        }
        this.estadoT = 'confirmacion';
    }

    seleccionarBusqueda(indice: number) {
        this.opciones.prestacion = this.busquedas[indice].prestacion;
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

    onSave() {
        let estado: String = 'asignado';
        let pacienteSave = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            telefono: this.paciente.telefono
        };
        this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
        let datosTurno = {
            idAgenda: this.agenda.id,
            indiceBloque: this.indiceBloque,
            indiceTurno: this.indiceTurno,
            estado: estado,
            paciente: pacienteSave,
            prestacion: this.turnoPrestacion

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
        this.showDarTurnos = true;
        window.setTimeout(() => this.pacientesSearch = false, 100);
        this.paciente = pacientes;
    }

    onCancel() {
        let listaEspera: any;
        let operacion: Observable<IListaEspera>;
        let datosPrestacion = {
            id: '581792ad3d52685d1ecdaa05', // this.opciones.prestacion.id,
            nombre: 'Cardiología adultos'// this.opciones.prestacion.nombre
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
            prestacion: datosPrestacion,
            profesional: datosProfesional,
            paciente: datosPaciente,
        };
        operacion = this.serviceListaEspera.post(listaEspera);
        operacion.subscribe();
    }

    constructor(public servicioPrestacion: PrestacionService,
        public serviceProfesional: ProfesionalService,
        public serviceAgenda: AgendaService,
        public serviceListaEspera: ListaEsperaService,
        public serviceTurno: TurnoService,
        public servicePaciente: PacienteService,
        public plex: Plex) { }

}
