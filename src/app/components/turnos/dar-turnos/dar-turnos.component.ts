type Estado = 'seleccionada' | 'noSeleccionada' | 'confirmacion' | 'noTurnos'

import { Plex } from 'andes-plex/src/lib/core/service';
import { TurnoService } from './../../../services/turnos/turno.service';
import { Observable } from 'rxjs/Rx';
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { IPaciente } from './../../../interfaces/IPaciente';
import { Component, AfterViewInit } from '@angular/core';
import * as moment from 'moment';

// Servicios
import { PrestacionService } from '../../../services/turnos/prestacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
const size = 4;

@Component({
    templateUrl: 'dar-turnos.html',
})
export class DarTurnosComponent implements AfterViewInit {
    public agenda: IAgenda;
    public agendas: IAgenda[];
    public opciones = {
        fecha: new Date(),
        prestacion: null,
        profesional: null,
    }

    public estadoT: Estado;
    private turno: ITurno[];
    private bloque: IBloque;
    private bloques: IBloque[];
    private indiceTurno: number;
    private indiceBloque: number;
    private telefono: String = '';

    private busquedas: any[] = localStorage.getItem('busquedas') ? JSON.parse(localStorage.getItem('busquedas')) : [];
    private alternativas: any[] = [];
    private reqfiltros: boolean = false;
    indice: number = -1;
    semana: String[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];
    paciente: any = {
        'documento': '30403872',
        'apellido': 'Diaz',
        'nombre': 'Ramiro',
        'telefono': ''
    };

    pacientesSearch: boolean = false;
    showDarTurnos: boolean = true;

    constructor(public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceAgenda: AgendaService, public serviceTurno: TurnoService, public plex: Plex) { }

    ngAfterViewInit() {
        this.actualizar('sinFiltro');

    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    filtrar() {
        let search = {
            'prestacion': this.opciones.prestacion ? this.opciones.prestacion : null,
            'profesional': this.opciones.profesional ? this.opciones.profesional : null
        };
        if (this.busquedas.length == size) {
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
        if (etiqueta != 'sinFiltro') {
            params = {
                'idPrestacion': this.opciones.prestacion ? this.opciones.prestacion.id : '',
                'idProfesional': this.opciones.profesional ? this.opciones.profesional.id : ''
            };
        } else {
            this.opciones.prestacion = null;
            this.opciones.profesional = null;
        }
        this.serviceAgenda.get(params).subscribe(agendas => { this.agendas = agendas; this.indice = -1; });
    }

    seleccionarAgenda(agenda) {
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
            } else {
                /*Si no hay turnos disponibles, se muestran alternativas (para eso deben haber seteado algún filtro)*/
                this.estadoT = 'noTurnos';
                if (this.opciones.prestacion || this.opciones.profesional) {
                    this.serviceAgenda.get({
                        'fechaDesde': moment(this.agenda.horaInicio).add(1, 'day').toDate(),
                        'idPrestacion': this.opciones.prestacion ? this.opciones.prestacion.id : null,
                        'idProfesional': this.opciones.profesional ? this.opciones.profesional.id : null,
                    }).subscribe(alternativas => { this.alternativas = alternativas; this.indice = -1; this.reqfiltros = false; });
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
        // let inicio = bloque.turnos[indice].horaInicio;
        this.estadoT = 'confirmacion';
    }

    seleccionarBuqueda(indice: number) {
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
        if (signo == '+') {
            this.opciones.fecha = moment(this.opciones.fecha).add(1, 'M').toDate();
        } else {
            this.opciones.fecha = moment(this.opciones.fecha).subtract(1, 'M').toDate();
        }
        this.actualizar('');
    }

    onSave() {
        let pacientes: any[];
        let estado: String = 'asignado';
        this.paciente = {
            'documento': '30403872',
            'apellido': 'Diaz',
            'nombre': 'Ramiro',
            'telefono': this.telefono
        };

        if (this.agenda.bloques[this.indiceBloque].pacienteSimultaneos) {
            pacientes = this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].pacientes.
                map(elem => { elem.nombre = elem.nombre, elem.apellido = elem.apellido, elem.documento = elem.documento; return elem; });
            pacientes.push(this.paciente);
            if (pacientes.length == this.agenda.bloques[this.indiceBloque].cantidadSimultaneos) {
                estado = 'asignado';
                this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
            } else {
                estado = 'disponible';
            }
        } else {
            this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
        }

        let datosTurno = {
            'idAgenda': this.agenda.id,
            'indiceBloque': this.indiceBloque,
            'indiceTurno': this.indiceTurno,
            'simultaneos': this.agenda.bloques[this.indiceBloque].pacienteSimultaneos,
            'cantsimultaneos': this.agenda.bloques[this.indiceBloque].cantidadSimultaneos,
            'estado': estado,
            'paciente': this.paciente,
            'pacientes': pacientes
        };

        let operacion: Observable<any>;
        operacion = this.serviceTurno.save(datosTurno);
        operacion.subscribe(resultado => {
            this.estadoT = 'noSeleccionada';
            this.agenda = null;
            this.actualizar('sinFiltro');
            this.plex.alert('El turno se asignó correctamente');
        });
    }

    buscarPaciente() {
        this.showDarTurnos = false;
        this.pacientesSearch = true;
    }

    public tieneTurnos(bloque: IBloque): boolean {

        let turnos = bloque.turnos;
        if (turnos.find(turno => turno.estado === 'disponible')){
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

    listaEspera() {
        if (this.estadoT === 'noTurnos' && !this.reqfiltros && this.alternativas.length === 0) {
            let datosPrestacion = !this.opciones.prestacion ? null : {
                id: this.opciones.prestacion.id,
                nombre: this.opciones.prestacion.nombre
            };
            let datosProfesional = !this.opciones.profesional ? null : {
                id: this.opciones.profesional.id,
                nombre: this.opciones.profesional.nombre,
                apellido: this.opciones.profesional.apellido
            };
            let datosLista = {
                paciente: this.paciente,
                prestacion: datosPrestacion,
                profesional: datosProfesional,
                fecha: this.agenda.horaInicio,
                estado: 'demandaRechazada'
            };
            // TODO: llamar al servicio para hacer un post (falta crear servicio)
        }
    }
}
