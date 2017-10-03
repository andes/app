import { Component, Input, Output, EventEmitter, OnInit, HostBinding } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { enumToArray } from '../../../../utils/enums';
import { EstadosAsistencia } from './../../enums';
import { EstadosAgenda } from './../../enums';

// Interfaces
import { IPaciente } from './../../../../interfaces/IPaciente';

// Servicios
import { PacienteService } from './../../../../services/paciente.service';
import { TurnoService } from './../../../../services/turnos/turno.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { Cie10Service } from './../../../../services/term/cie10.service';


@Component({
    selector: 'revision-agenda',
    templateUrl: 'revision-agenda.html'
})

export class RevisionAgendaComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    private _agenda: any;
    // Parámetros
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
        this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;
        }
        this.estadoAsistenciaCerrada = this.estadosAgendaArray.find(e => {
            return e.nombre === 'Asistencia Cerrada';
        });
        this.estadoCodificado = this.estadosAgendaArray.find(e => {
            return e.nombre === 'Codificada';
        });
        this.enableAsistenciaCerrada = (!(this._agenda.estado === this.estadoAsistenciaCerrada.id)) && (!(this._agenda.estado === this.estadoCodificado.id));
        this.enableCodificada = (this._agenda.estado === this.estadoAsistenciaCerrada.id);
    }
    get agenda(): any {
        return this._agenda;
    }
    @Input() modoCompleto = true;

    @Output() volverAlGestor = new EventEmitter<boolean>();
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

    showRevisionAgenda: Boolean = true;
    turnos = [];
    sobreturnos = [];
    horaInicio: any;
    turnoSeleccionado: any = null;
    bloqueSeleccionado: any = null;
    nuevoCodigo: any;
    codigoPrincipal = [];
    paciente: IPaciente;
    cambioTelefono = false;
    turnoTipoPrestacion: any = {};
    pacientesSearch = false;
    telefono: String = '';
    diagnosticos = [];
    enableCodificada = false;
    enableAsistenciaCerrada = true;
    public showRegistrosTurno = false;
    public seleccion = null;
    public esEscaneado = false;
    public estadosAsistencia = enumToArray(EstadosAsistencia);
    private estadoAsistenciaCerrada;
    private estadoCodificado;
    public estadosAgendaArray = enumToArray(EstadosAgenda);


    constructor(public plex: Plex,
        public router: Router,
        public auth: Auth,
        private serviceCie10: Cie10Service,
        public serviceTurno: TurnoService,
        public serviceAgenda: AgendaService,
        public servicePaciente: PacienteService) {
    }

    ngOnInit() {
    }

    buscarPaciente() {
        this.showRegistrosTurno = false;
        this.pacientesSearch = true;
    }

    asignarPaciente(paciente) {
        let estado: String = 'asignado';
        let telefono;
        if (paciente.contacto) {
            if (paciente.contacto.length > 0) {
                paciente.contacto.forEach((contacto) => {
                    if (contacto.tipo === 'celular') {
                        telefono = contacto.valor;
                    }
                });
            }
        }
        let pacienteTurno = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            telefono: telefono
        };
        if (this.turnoSeleccionado) {
            this.turnoSeleccionado.paciente = pacienteTurno;
            this.turnoSeleccionado.estado = estado;
        }
    }

    onReturn(paciente: IPaciente): void {
        if (paciente.id) {
            this.paciente = paciente;
            this.showRegistrosTurno = true;
            this.pacientesSearch = false;
            window.setTimeout(() => this.pacientesSearch = false, 100);
        } else {
            this.seleccion = paciente;
            this.esEscaneado = true;
            this.escaneado.emit(this.esEscaneado);
            this.selected.emit(this.seleccion);
        }
    }


    seleccionarTurno(turno, bloque) {
        this.diagnosticos = [];
        this.paciente = null;
        if (this.turnoSeleccionado === turno) {
            this.turnoSeleccionado = null;

        } else {
            this.turnoSeleccionado = null;
            this.turnoSeleccionado = turno;
            this.bloqueSeleccionado = bloque;
            this.pacientesSearch = false;
            if (turno.diagnosticoPrincipal && turno.diagnosticoPrincipal.codificacion) {
                this.diagnosticos.push(turno.diagnosticoPrincipal);
            }
            if (turno.diagnosticoSecundario && turno.diagnosticoSecundario.length) {
                this.diagnosticos = this.diagnosticos.concat(turno.diagnosticoSecundario);
            }
        }
    }

    seleccionarAsistencia(asistencia, i) {
        if (this.turnoSeleccionado) {
            this.turnoSeleccionado.asistencia = asistencia.id;
        }
    }

    asistenciaSeleccionada(asistencia) {
        if (asistencia.id === 'asistio') {
            if (!this.turnoSeleccionado.diagnosticoPrincipal) {
                this.turnoSeleccionado.diagnosticoPrincipal = {
                    codificacion: null,
                    ilegible: false
                };
            }
        }
        return (this.turnoSeleccionado.asistencia === asistencia.id);
    }

    estaSeleccionado(turno: any) {
        this.showRegistrosTurno = true;
        return (this.turnoSeleccionado === turno); // .indexOf(turno) >= 0;
    }

    buscarCodificacion(event) {
        let query = {
            nombre: event.query
        };
        if (event.query) {
            this.serviceCie10.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    agregarDiagnostico() {
        let nuevoDiagnostico = { codificacion: null, ilegible: false };
        if (this.nuevoCodigo) {
            nuevoDiagnostico.codificacion = this.nuevoCodigo;
            delete nuevoDiagnostico.codificacion.$order;
            this.diagnosticos.push(nuevoDiagnostico);
            this.nuevoCodigo = {};
        }
    }

    borrarDiagnostico(index) {
        if (index === 0) {
            this.plex.toast('warning', 'Información', 'El diagnostico principal fue eliminado');
        }
        this.diagnosticos.splice(index, 1);
    }

    marcarIlegible() {
        this.turnoSeleccionado.diagnosticoPrincipal.codificacion = null;
        this.turnoSeleccionado.diagnosticoPrincipal.primeraVez = false;
        this.diagnosticos = [];
        this.turnoSeleccionado.diagnosticoSecundario = [];
    }

    cerrarAsistencia() {
        // Se verifica que todos los campos tengan asistencia chequeada
        let turnoSinVerificar = null;
        let listaTurnos = [];
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            listaTurnos = listaTurnos.concat(this.agenda.bloques[i].turnos);
        }
        for (let i = 0; i < this.agenda.sobreturnos.length; i++) {
            listaTurnos = listaTurnos.concat(this.agenda.sobreturnos[i].turnos);
        }
        // turnoSinVerificar = this.turnos.find(t => {
        turnoSinVerificar = listaTurnos.find(t => {
            return (t && t.paciente && t.paciente.id && !t.asistencia && t.estado !== 'suspendido');
        });
        if (turnoSinVerificar) {
            // this.plex.alert('No se puede cerrar la asistencia debido a que existen turnos que no fueron verificados', 'Cerrar Asistencia');
        } else {
            // Se cambia de estado la agenda a asistenciaCerrada
            let patch = {
                'op': this.estadoAsistenciaCerrada.id,
                'estado': this.estadoAsistenciaCerrada.id
            };
            this.serviceAgenda.patch(this._agenda.id, patch).subscribe(resultado => {
                this.plex.toast('success', 'El estado de la agenda fue actualizado', 'Asistencia Cerrada');
                // this.enableAsistenciaCerrada = false;
                // this.enableCodificada = true;
            });
        }
    }

    cerrarCodificacion() {
        // Se verifica que todos los campos tengan el diagnostico codificado
        let turnoSinCodificar = null;
        let listaTurnos = [];
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            listaTurnos = listaTurnos.concat(this.agenda.bloques[i].turnos);
        }
        for (let i = 0; i < this.agenda.sobreturnos.length; i++) {
            listaTurnos = listaTurnos.concat(this.agenda.sobreturnos[i].turnos);
        }
        turnoSinCodificar = listaTurnos.find(t => {
            return (
                t && t.paciente && t.paciente.id &&
                ((t.asistencia && !t.diagnosticoPrincipal || (t.diagnosticoPrincipal && !t.diagnosticoPrincipal.codificacion && !t.diagnosticoPrincipal.ilegible && t.asistencia === 'asistio' )) ||
                !t.asistencia)
            );
        });

        if (turnoSinCodificar) {
            // this.plex.alert('No se puede cerrar la codificación debido a que existen turnos que no fueron chequeados',
            // 'Cerrar Codificación');
        } else {
            // Se cambia de estado la agenda a asistenciaCerrada
            let patch = {
                'op': this.estadoCodificado.id,
                'estado': this.estadoCodificado.id
            };
            this.serviceAgenda.patch(this._agenda.id, patch).subscribe(resultado => {
                this.plex.toast('success', 'El estado de la agenda fue actualizado', 'Codificación Cerrada');
                this.enableAsistenciaCerrada = false;
                this.enableCodificada = false;
            });
        }

    }

    cancelar() {
        this.turnoSeleccionado = null;
    }

    onSave() {
        // Se guarda el turno seleccionado
        if (this.paciente) {
            this.asignarPaciente(this.paciente);
        }
        if (this.turnoTipoPrestacion) {
            this.turnoSeleccionado.tipoPrestacion = this.turnoTipoPrestacion;
        };
        // TODO: Aca chequear los sobreturnos => this.bloqueSeleccinado == -1
        let datosTurno = {};
        if (this.diagnosticos && this.diagnosticos.length && this.diagnosticos.length > 0) {
            this.turnoSeleccionado.diagnosticoPrincipal = this.diagnosticos[0];
            this.turnoSeleccionado.diagnosticoSecundario = this.diagnosticos.slice(1, this.diagnosticos.length);
        }
        if (this.bloqueSeleccionado === -1) {
            datosTurno = {
                idAgenda: this.agenda.id,
                idTurno: this.turnoSeleccionado.id,
                idBloque: -1,
                turno: this.turnoSeleccionado
            };
        } else {
            datosTurno = {
                idAgenda: this.agenda.id,
                idTurno: this.turnoSeleccionado.id,
                idBloque: this.bloqueSeleccionado.id,
                turno: this.turnoSeleccionado
            };
        }

        if (this.turnoSeleccionado.tipoPrestacion) {
            this.serviceTurno.put(datosTurno).subscribe(resultado => {
                this.plex.toast('success', 'Información', 'El turno fue actualizado');
                this.cerrarAsistencia();
                this.cerrarCodificacion();
                this.turnoSeleccionado = null;
            });
        } else {
            this.plex.alert('Debe seleccionar un tipo de Prestacion');
        }
    }

    volver() {
        this.volverAlGestor.emit(true);

    }

}
