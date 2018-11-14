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
import { Cie10Service } from '../../../../services/term/cie10.service';

@Component({
    selector: 'revision-agenda',
    templateUrl: 'revision-agenda.html',
    styleUrls: ['revision-agenda.scss']
})

export class RevisionAgendaComponent implements OnInit {

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

    public cantidadTurnosAsignados: number;
    private estadoPendienteAuditoria;
    private estadoCodificado;

    indiceReparo: any;
    public showReparo = false;
    existeCodificacionProfesional: Boolean;
    showRevisionAgenda: Boolean = true;
    showAgregarSobreturno: Boolean = false;
    horaInicio: any;
    turnoSeleccionado: any = null;
    bloqueSeleccionado: any = null;
    paciente: IPaciente;
    turnoTipoPrestacion: any = null;
    pacientesSearch = false;
    diagnosticos = [];
    public showRegistrosTurno = false;
    public esEscaneado = false;
    public estadosAsistencia = enumToArray(EstadosAsistencia);
    public estadosAgendaArray = enumToArray(EstadosAgenda);
    public mostrarHeaderCompleto = false;
    public esAgendaOdonto = false;
    idOrganizacion = this.auth.organizacion.id;

    constructor(public plex: Plex,
        public router: Router,
        public auth: Auth,
        private serviceCie10: Cie10Service,
        public serviceTurno: TurnoService,
        public serviceAgenda: AgendaService,
        public servicePaciente: PacienteService) {
    }

    ngOnInit() {
        this.getCantidadTurnosAsignados();
        this.esAgendaOdonto = this._agenda.tipoPrestaciones[0].term.includes('odonto');
    }

    private getCantidadTurnosAsignados() {
        // verificamos la cant. de turnos asignados que tiene la agenda
        let turnosAsignados = [];
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            turnosAsignados = turnosAsignados.concat(this.agenda.bloques[i].turnos);
        }
        if (this.agenda.sobreturnos) {
            turnosAsignados = turnosAsignados.concat(this.agenda.sobreturnos);
        }
        turnosAsignados = turnosAsignados.filter(turno => {
            return (turno.paciente && turno.paciente.id);
        });
        this.cantidadTurnosAsignados = turnosAsignados.length;
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
            sexo: this.paciente.sexo,
            telefono: telefono,
            carpetaEfectores: this.paciente.carpetaEfectores
        };
        if (this.turnoSeleccionado) {
            this.turnoSeleccionado.paciente = pacienteTurno;
            this.turnoSeleccionado.estado = estado;
        }
    }
    /**
     * Output de la búsqueda de paciente
     *
     * @param {IPaciente} paciente
     * @memberof RevisionAgendaComponent
     */
    onReturn(paciente: IPaciente): void {
        if (paciente.id) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMongo => {
                    this.paciente = pacienteMongo;
                    this.showRegistrosTurno = true;
                    this.pacientesSearch = false;
                    window.setTimeout(() => this.pacientesSearch = false, 100);
                });
        } else {
            this.plex.alert('Paciente no encontrado', '¡Error!');
        }
    }


    seleccionarTurno(turno, bloque) {
        this.existeCodificacionProfesional = false;
        this.diagnosticos = [];
        this.paciente = null;
        this.bloqueSeleccionado = bloque;
        this.showReparo = false;
        if (this.bloqueSeleccionado && this.bloqueSeleccionado !== -1) {
            this.turnoTipoPrestacion = this.bloqueSeleccionado.tipoPrestaciones.length === 1 ? this.bloqueSeleccionado.tipoPrestaciones[0] : null;
        } else { // para el caso de sobreturno, que no tiene bloques.
            this.turnoTipoPrestacion = turno.tipoPrestacion;
        }
        if (this.turnoSeleccionado === turno) {
            this.turnoSeleccionado = null;
        } else {
            this.turnoSeleccionado = turno;
            this.pacientesSearch = false;
            if (turno.diagnostico.codificaciones && turno.diagnostico.codificaciones.length) {
                this.diagnosticos = this.diagnosticos.concat(turno.diagnostico.codificaciones);
            }
        }
    }

    seleccionarAsistencia(asistencia) {
        if (this.turnoSeleccionado) {
            this.turnoSeleccionado.asistencia = asistencia.id;
        }
        this.onSave();
    }

    asistenciaSeleccionada(asistencia) {
        return (this.turnoSeleccionado.asistencia === asistencia.id);
    }

    estaSeleccionado(turno: any) {
        this.showRegistrosTurno = true;
        return (this.turnoSeleccionado === turno); // .indexOf(turno) >= 0;
    }

    /**
     * El auditor agrega nuevos diagnósticos al turno en el momento de revisión
     * la codificaciónProfesional en estos casos debe ser siempre NULL
     *
     * @memberof RevisionAgendaComponent
     */
    agregarDiagnostico(diagnostico) {
        let nuevoDiagnostico = {
            codificacionProfesional: null, // solamente obtenida de RUP o SIPS y definida por el profesional
            codificacionAuditoria: null,  // corresponde a la codificación establecida la instancia de revisión de agendas
            primeraVez: false
        };
        nuevoDiagnostico.codificacionAuditoria = diagnostico;
        this.diagnosticos.push(nuevoDiagnostico);
        this.onSave();
    }

    borrarDiagnostico(index) {
        if (!this.diagnosticos[index].codificacionProfesional || (this.diagnosticos[index].codificacionProfesional && this.diagnosticos[index].codificacionProfesional.snomed && !this.diagnosticos[index].codificacionProfesional.snomed.term)) {
            this.diagnosticos.splice(index, 1);
        } else {
            this.diagnosticos[index].codificacionAuditoria = null;
        }
        if (index === 0) {
            this.plex.toast('warning', 'Información', 'El diagnostico principal fue eliminado');
        }
        this.onSave();
    }

    aprobar(index) {
        this.diagnosticos[index].codificacionAuditoria = this.diagnosticos[index].codificacionProfesional.cie10;
        this.onSave();
    }
    /**
     * Verifica si cada turno tiene la asistencia verificada y modifica el estado de la agenda.
     *
     * @memberof RevisionAgendaComponent
     */
    cerrarAsistencia() {
        // Se verifica que todos los campos tengan asistencia chequeada
        let turnoSinVerificar = null;
        let turnoSinCodificar = null;
        let label;
        let patch;
        let patchear = true;

        let listaTurnos = [];
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            listaTurnos = listaTurnos.concat(this.agenda.bloques[i].turnos);
        }
        if (this.agenda.sobreturnos) {
            listaTurnos = listaTurnos.concat(this.agenda.sobreturnos);
        }

        turnoSinVerificar = listaTurnos.find(t => {
            return (t && t.paciente && t.paciente.id && !t.asistencia && t.estado !== 'suspendido' && t.estado !== 'turnoDoble');
        });

        turnoSinCodificar = listaTurnos.find(t => {
            return (
                t && t.paciente && t.paciente.id &&
                ((t.asistencia === 'asistio' && !t.diagnostico.codificaciones[0] || (t.diagnostico.codificaciones[0] && !t.diagnostico.codificaciones[0].codificacionAuditoria
                    && !t.diagnostico.ilegible && t.asistencia === 'asistio')) || !t.asistencia)
            );
        });

        if (!turnoSinCodificar) {
            // Se cambia de estado la agenda a Auditada
            patch = {
                'op': this.estadoCodificado.id,
                'estado': this.estadoCodificado.id
            };
            label = 'Auditada';
        } else {
            if (!turnoSinVerificar) { // Si todos los turnos tienen la asistencia verificada
                // Se cambia de estado la agenda a pendienteAuditoria
                patch = {
                    'op': 'pendienteAuditoria',
                    'estado': 'pendienteAuditoria'
                };
                label = 'Pendiente Auditoria';
            } else {
                // este caso se dá cuando se agregan sobreturnos desde la auditoria
                // si hay algún turno sin verificar asistencia y la agenda ya está en otro estado, se vuelve a pendiente asisitencia
                if (this.agenda.estado !== 'pendienteAsistencia') {
                    // Se cambia de estado la agenda a pendienteAuditoria
                    patch = {
                        'op': 'pendienteAsistencia',
                        'estado': 'pendienteAsistencia'
                    };
                    label = 'Pendiente Asistencia';
                } else {
                    patchear = false;
                }
            }
        }
        if (patchear) {
            this.serviceAgenda.patch(this._agenda.id, patch).subscribe(resultado => {
                this.plex.toast('success', 'El estado de la agenda fue actualizado', label);
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
        }
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
                this.cerrarAsistencia();
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
    /**
     * Agrega el diagnóstico provisto por el revisor, y persiste el cambio automáticamente
     *
     * @param {any} reparo
     * @memberof RevisionAgendaComponent
     */
    repararDiagnostico(reparo) {
        if (reparo) {
            this.diagnosticos[this.indiceReparo].codificacionAuditoria = reparo;
            this.showReparo = false;
        }
        this.onSave();
    }

    borrarReparo(index) {
        this.diagnosticos[index].codificacionAuditoria = null;
        this.showReparo = false;
        this.onSave();
    }

    volverRevision() {
        this.showAgregarSobreturno = false;
        this.showRevisionAgenda = true;
        this.modoCompleto = true;
        this.refresh();
        this.cerrarAsistencia();
    }
}
