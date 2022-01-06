import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { enumToArray } from '../../../../utils/enums';
import { EstadosAsistencia } from './../../enums';
import { EstadosAgenda } from './../../enums';

// Interfaces
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

// Servicios
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { TurnoService } from './../../../../services/turnos/turno.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { PacienteCacheService } from '../../../../core/mpi/services/pacienteCache.service';
import { Subscription } from 'rxjs';
import { Unsubscribe } from '@andes/shared';

@Component({
    selector: 'revision-agenda',
    templateUrl: 'revision-agenda.html',
    styleUrls: ['revision-agenda.scss'],
})

export class RevisionAgendaComponent implements OnInit, OnDestroy {
    private lastRequest: Subscription;
    private _agenda: any;
    private estadoPendienteAuditoria;
    private estadoCodificado;
    public agenda: any;
    public cantidadTurnosAsignados: number;
    public indiceReparo: any;
    public showReparo = false;
    public existeCodificacionProfesional: Boolean;
    public horaInicio: any;
    public turnoSeleccionado: any = null;
    public bloqueSeleccionado: any = null;
    public paciente: IPaciente;
    public turnoTipoPrestacion: any = null;
    public pacientesSearch = false;
    public diagnosticos = [];
    public showRegistrosTurno = false;
    public estadosAsistencia = enumToArray(EstadosAsistencia);
    public estadosAgendaArray = enumToArray(EstadosAgenda);
    public mostrarHeaderCompleto = false;
    public esAgendaOdonto = false;
    public idOrganizacion = this.auth.organizacion.id;
    // ---- Variables asociadas a componentes paciente buscar y paciente listado
    public resultadoBusqueda = null;
    public pacienteSelected = null;
    public loading = false;
    public pacienteDetalle;

    constructor(
        private pacienteCache: PacienteCacheService,
        public plex: Plex,
        public router: Router,
        public auth: Auth,
        public serviceTurno: TurnoService,
        public serviceAgenda: AgendaService,
        public servicePaciente: PacienteService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params && params['idAgenda']) {
                this.serviceAgenda.getById(params['idAgenda']).subscribe(agenda => {
                    this._agenda = agenda;
                    this.agenda = agenda;
                    this.getCantidadTurnosAsignados();
                    this.esAgendaOdonto = this._agenda.tipoPrestaciones[0].term.includes('odonto');
                });
            }
        });
        localStorage.removeItem('revision');
    }
    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
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
        this.onSearchClear();
        this.showRegistrosTurno = false;
        this.pacientesSearch = true;
    }

    asignarPaciente(paciente) {
        const estado: String = 'asignado';
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
        const pacienteTurno = {
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

    seleccionarTurno(turno, bloque) {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
        this.pacienteDetalle = null;
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
            if (turno.paciente && turno.paciente.id) {
                this.pacienteDetalle = turno.paciente;
                this.lastRequest = this.servicePaciente.getById(turno.paciente.id).subscribe(
                    pacienteMongo => {
                        this.pacienteDetalle = pacienteMongo;
                        delete this.pacienteDetalle.cuil;
                    });
            }
        }
    }

    seleccionarAsistencia(asistencia) {
        if (this.turnoSeleccionado && this.turnoSeleccionado.asistencia) {
            this.turnoSeleccionado.asistencia = asistencia.id;
        }
        this.onSave();
    }

    asistenciaSeleccionada(asistencia) {
        return (this.turnoSeleccionado.asistencia && this.turnoSeleccionado.asistencia === asistencia.id);
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
        const nuevoDiagnostico = {
            codificacionProfesional: null, // solamente obtenida de RUP o SIPS y definida por el profesional
            codificacionAuditoria: null, // corresponde a la codificación establecida la instancia de revisión de agendas
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
        // En el caso que aprueben el primer diagnóstico, se aprueba el resto
        if (index === 0) {
            for (let j = 1; j < this.diagnosticos.length; j++) {
                this.diagnosticos[j].codificacionAuditoria = this.diagnosticos[j].codificacionProfesional.cie10;
            }
        }
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
                t && t.paciente && t.paciente.id && t.estado !== 'suspendido' && t.estado !== 'turnoDoble' &&
                ((t.asistencia === 'asistio' && !t.diagnostico.codificaciones[0] || (t.diagnostico.codificaciones[0] && !t.diagnostico.codificaciones[0].codificacionAuditoria
                    && !t.diagnostico.ilegible && t.asistencia === 'asistio')) || !t.asistencia)
            );
        });
        if (!turnoSinCodificar) {
            this.agenda.estado = 'auditada';
            // Se cambia de estado la agenda a Auditada
            patch = {
                'op': 'auditada',
                'estado': 'auditada'
            };
            label = 'Auditada';
        } else {
            if (!turnoSinVerificar) { // Si todos los turnos tienen la asistencia verificada
                // Se cambia de estado la agenda a pendienteAuditoria
                this.agenda.estado = 'pendienteAuditoria';
                patch = {
                    'op': 'pendienteAuditoria',
                    'estado': 'pendienteAuditoria'
                };
                label = 'Pendiente Auditoria';
            } else {
                // este caso se dá cuando se agregan sobreturnos desde la auditoria
                // si hay algún turno sin verificar asistencia y la agenda ya está en otro estado, se vuelve a pendiente asisitencia
                if (this.agenda.estado !== 'pendienteAsistencia') {
                    this.agenda.estado = 'pendienteAsistencia';
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

    isRegistradoProfesional(turno) {
        let sinCodificaciones;
        let sinAuditorias;
        if (turno && turno.diagnostico && turno.diagnostico.codificaciones && turno.diagnostico.codificaciones.length) {
            sinCodificaciones = turno.diagnostico.codificaciones.find(cod => (!cod.codificacionProfesional || !cod.codificacionProfesional.snomed || !cod.codificacionProfesional.snomed.term));
            sinAuditorias = turno.diagnostico.codificaciones.find(cod => !cod.codificacionAuditoria);
        }
        const esCodificado = turno && turno.paciente && turno.asistencia && (turno.asistencia === 'noAsistio' || turno.asistencia === 'sinDatos' || (!sinCodificaciones && sinAuditorias));
        return esCodificado;
    }
    isAuditado(turno) {
        let sinAuditorias;
        if (turno && turno.diagnostico && turno.diagnostico.codificaciones && turno.diagnostico.codificaciones.length) {
            sinAuditorias = turno.diagnostico.codificaciones.find(cod => !cod.codificacionAuditoria);
        }
        if (turno && turno.diagnostico && turno.diagnostico.codificaciones && !turno.diagnostico.codificaciones.length) {
            sinAuditorias = true; // El turno no tiene codificaciones asociadas
        }
        const esAuditado = turno && turno.paciente && turno.asistencia && (turno.asistencia === 'noAsistio' || turno.asistencia === 'sinDatos' || !sinAuditorias);
        return esAuditado;
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
            this.plex.info('warning', 'Debe seleccionar un tipo de Prestacion');
        }
    }

    agregarSobreturno() {
        localStorage.setItem('revision', 'true');
        this.router.navigate(['citas/sobreturnos', this.agenda._id]);
    }

    agregarPaciente() {
        this.router.navigate(['citas/paciente', this.agenda._id]);
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
        this.router.navigate(['citas/gestor_agendas']);
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
    repararDiagnostico(reparo: any) {
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
        this.refresh();
        this.cerrarAsistencia();
    }

    // -------------- SOBRE BUSCADOR PACIENTES ----------------

    searchStart() {
        this.paciente = null;
        this.loading = true;
    }


    searchEnd(pacientes: IPaciente[], scan: string) {
        this.loading = false;
        const escaneado = scan?.length > 0;
        this.pacienteCache.setScanCode(scan);
        if (escaneado && pacientes.length === 1 && pacientes[0].id) {
            this.onSelect(pacientes[0]);
        } else if (escaneado && pacientes.length === 1 && (!pacientes[0].id || (pacientes[0].estado === 'temporal' && pacientes[0].scan))) {
            this.pacienteCache.setPaciente(pacientes[0]);
            this.pacienteCache.setScanCode(scan);
            this.router.navigate(['/apps/mpi/paciente/con-dni/sobreturno']); // abre paciente-cru
        } else {
            this.resultadoBusqueda = pacientes;
        }
    }

    onSearchClear() {
        this.resultadoBusqueda = null;
        this.paciente = null;
    }

    // ----------------------------------

    // Componente paciente-listado
    @Unsubscribe()
    onSelect(paciente: IPaciente) {
        // Es un paciente existente en ANDES??
        if (paciente && paciente.id) {
            this.loading = true;
            this.resultadoBusqueda = null;
            // Si se seleccionó por error un paciente fallecido
            this.servicePaciente.checkFallecido(paciente);
            return this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMongo => {
                    this.loading = false;
                    this.paciente = pacienteMongo;
                    this.pacienteDetalle = pacienteMongo;
                    delete this.pacienteDetalle.cuil;
                    this.showRegistrosTurno = true;
                    this.pacientesSearch = false;
                });
        } else {
            this.plex.info('warning', 'Paciente no encontrado', '¡Error!');
        }

    }
    // ----------------------------------

}
