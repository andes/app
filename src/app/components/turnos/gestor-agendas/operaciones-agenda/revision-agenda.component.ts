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
    templateUrl: 'revision-agenda.html',
    styleUrls: ['.././turnos.scss']
})

export class RevisionAgendaComponent implements OnInit {
    indiceReparo: any;
    @HostBinding('class.plex-layout') layout = true;
    private _agenda: any;
    // Parámetros
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
        this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();
        this.estadoPendienteAuditoria = this.estadosAgendaArray.find(e => {
            return e.nombre === 'Pendiente Auditoria';
        });
        this.estadoCodificado = this.estadosAgendaArray.find(e => {
            return e.nombre === 'Auditada';
        });
    }
    get agenda(): any {
        return this._agenda;
    }
    @Input() modoCompleto = true;

    @Output() volverAlGestor = new EventEmitter<boolean>();
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

    public showReparo = false;
    existeCodificacionProfesional: Boolean;
    showRevisionAgenda: Boolean = true;
    showAgregarSobreturno: Boolean = false;
    sobreturnos = [];
    horaInicio: any;
    turnoSeleccionado: any = null;
    bloqueSeleccionado: any = null;
    nuevoCodigo: any;
    reparo: any;
    paciente: IPaciente;
    turnoTipoPrestacion: any = null;
    pacientesSearch = false;
    diagnosticos = [];
    public showRegistrosTurno = false;
    public seleccion = null;
    public esEscaneado = false;
    public estadosAsistencia = enumToArray(EstadosAsistencia);
    private estadoPendienteAuditoria;
    private estadoCodificado;
    public estadosAgendaArray = enumToArray(EstadosAgenda);
    public mostrarHeaderCompleto = false;


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
            fechaNacimiento: this.paciente.fechaNacimiento,
            telefono: telefono,
            carpetaEfectores: this.paciente.carpetaEfectores
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
        this.existeCodificacionProfesional = false;
        this.diagnosticos = [];
        this.paciente = null;
        this.bloqueSeleccionado = bloque;
        if (this.bloqueSeleccionado && this.bloqueSeleccionado !== -1) {
            this.turnoTipoPrestacion = this.bloqueSeleccionado.tipoPrestaciones.length === 1 ? this.bloqueSeleccionado.tipoPrestaciones[0] : null;
        } else { // para el caso de sobreturno, que no tiene bloques.
            this.turnoTipoPrestacion = turno.tipoPrestacion;
        }
        if (this.turnoSeleccionado === turno) {
            this.turnoSeleccionado = null;
            this.showReparo = false;
        } else {
            this.turnoSeleccionado = turno;
            this.pacientesSearch = false;
            if (turno.diagnostico.codificaciones && turno.diagnostico.codificaciones.length) {
                this.diagnosticos = this.diagnosticos.concat(turno.diagnostico.codificaciones);
                // Verificamos si existe alguna codificación de profesional.
                this.existeCodificacionProfesional = (this.diagnosticos.filter(elem => elem.codificacionProfesional !== null)).length > 0 ? true : false;
            }
        }
    }

    seleccionarAsistencia(asistencia, i) {
        if (this.turnoSeleccionado) {
            this.turnoSeleccionado.asistencia = asistencia.id;
        }
    }

    asistenciaSeleccionada(asistencia) {
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
            this.serviceCie10.get(query).subscribe((datos) => {
                this.diagnosticos.forEach(elem => {
                    let index = datos.findIndex((item) => item.codigo === elem.codificacion.codigo);
                    if (index >= 0) {
                        datos.splice(index, 1);
                    }
                });

                event.callback(datos);
            });
        } else {
            event.callback([]);
        }
    }
    /**
     * El auditor agrega nuevos diagnósticos al turno en el momento de revisión
     * la codificaciónProfesional en estos casos debe ser siempre NULL
     *
     * @memberof RevisionAgendaComponent
     */
    agregarDiagnostico() {
        let nuevoDiagnostico = {
            codificacionProfesional: null, // solamente obtenida de RUP o SIPS y definida por el profesional
            codificacionAuditoria: null,  // corresponde a la codificación establecida la instancia de revisión de agendas
            primeraVez: false
        };
        if (this.nuevoCodigo) {
            nuevoDiagnostico.codificacionAuditoria = this.nuevoCodigo;
            delete nuevoDiagnostico.codificacionAuditoria.$order;
            this.diagnosticos.push(nuevoDiagnostico);
            this.nuevoCodigo = {};
        }
    }

    borrarDiagnostico(index) {
        if (this.diagnosticos[index].codificacionProfesional === null) {
            this.diagnosticos.splice(index, 1);
        } else {
            this.diagnosticos[index].codificacionAuditoria = null;
        }
        if (index === 0) {
            this.plex.toast('warning', 'Información', 'El diagnostico principal fue eliminado');
        }
    }

    aprobar(index) {
        this.diagnosticos[index].codificacionAuditoria = this.diagnosticos[index].codificacionProfesional;
    }


    marcarIlegible() {
        this.turnoSeleccionado.diagnostico.codificaciones[0].codificacionAuditoria = 'Ilegible';
        this.turnoSeleccionado.diagnostico.codificaciones[0].primeraVez = false;
        this.diagnosticos = [];
    }

    cerrarAsistencia() {
        // Se verifica que todos los campos tengan asistencia chequeada
        let turnoSinVerificar = null;
        let listaTurnos = [];
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            listaTurnos = listaTurnos.concat(this.agenda.bloques[i].turnos);
        }
        if (this.agenda.sobreturnos) {
            listaTurnos = listaTurnos.concat(this.agenda.sobreturnos);
        }
        // turnoSinVerificar = this.turnos.find(t => {
        turnoSinVerificar = listaTurnos.find(t => {
            return (t && t.paciente && t.paciente.id && !t.asistencia && t.estado !== 'suspendido');
        });
        if (!turnoSinVerificar) {
            // TODO!!!
            // Se cambia de estado la agenda a pendienteAuditoria
            let patch = {
                'op': 'pendienteAuditoria',
                'estado': 'pendienteAuditoria'
            };
            this.serviceAgenda.patch(this._agenda.id, patch).subscribe(resultado => {
                this.plex.toast('success', 'El estado de la agenda fue actualizado', 'Pendiente Auditoria');
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
        if (this.agenda.sobreturnos) {
            listaTurnos = listaTurnos.concat(this.agenda.sobreturnos);
        }
        turnoSinCodificar = listaTurnos.find(t => {
            return (
                t && t.paciente && t.paciente.id &&
                ((t.asistencia && !t.diagnostico.codificaciones[0] || (t.diagnostico.codificaciones[0] && !t.diagnostico.codificaciones[0].codificacionAuditoria
                    && !t.diagnostico.ilegible && t.asistencia === 'asistio')) || !t.asistencia)
            );
        });

        if (!turnoSinCodificar) {
            // Se cambia de estado la agenda a asistenciaCerrada
            let patch = {
                'op': this.estadoCodificado.id,
                'estado': this.estadoCodificado.id
            };
            this.serviceAgenda.patch(this._agenda.id, patch).subscribe(resultado => {
                this.plex.toast('success', 'El estado de la agenda fue actualizado', 'Auditada');
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
        let datosTurno = {};
        if (this.diagnosticos) {
            this.turnoSeleccionado.diagnostico.codificaciones = this.diagnosticos;
        }
        // Aca chequeamos si es o no sobreturno
        if (this.bloqueSeleccionado && this.bloqueSeleccionado !== -1) {
            datosTurno = {
                idAgenda: this.agenda.id,
                idTurno: this.turnoSeleccionado.id,
                idBloque: this.bloqueSeleccionado.id,
                turno: this.turnoSeleccionado
            };
        } else {
            // Caso de sobreturno.
            datosTurno = {
                idAgenda: this.agenda.id,
                idTurno: this.turnoSeleccionado.id,
                idBloque: -1,
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

    agregarSobreturno() {
        this.showAgregarSobreturno = true;
        this.showRevisionAgenda = false;
        this.modoCompleto = false;
    }

    refresh() {
        this.serviceAgenda.getById(this._agenda.id).subscribe(agenda => {
            this._agenda = agenda;

        }, err => {
            if (err) {
                console.log(err);
            }
        });
    }

    volver() {
        this.volverAlGestor.emit(true);
    }

    mostrarReparo(index) {
        this.indiceReparo = index;
        this.showReparo = true;
    }

    repararDiagnostico() {
        if (this.reparo) {
            this.diagnosticos[this.indiceReparo].codificacionAuditoria = this.reparo;
            this.showReparo = false;
        }
    }

    borrarReparo(index) {
        this.diagnosticos[this.indiceReparo].codificacionAuditoria = null;
        this.showReparo = false;
    }

    volverRevision() {
        this.showAgregarSobreturno = false;
        this.showRevisionAgenda = true;
        this.modoCompleto = true;
        this.refresh();
    }

}
