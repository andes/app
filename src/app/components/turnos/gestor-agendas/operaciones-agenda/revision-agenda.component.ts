import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';

@Component({
    selector: 'revision-agenda',
    templateUrl: 'revision-agenda.html',
    styleUrls: ['revision-agenda.scss'],
})

export class RevisionAgendaComponent implements OnInit, OnDestroy {

    @Input() agenda: IAgenda;

    @Output() returnSuspenderAgenda = new EventEmitter<any>();
    @Output() cerrarSidebar = new EventEmitter<any>();

    private lastRequest: Subscription;
    public cantidadTurnosAsignados: number;
    public indiceReparo: any;
    private indiceDiagnostico = -1;
    public showCodificacion = false;
    public showReparo = false;
    public showSobreturno = false;
    public showAddPaciente = false;
    public showModifAsistencia = false;
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
    public estadosAgenda = EstadosAgenda;
    public estadosAgendaArray = enumToArray(EstadosAgenda);
    public mostrarHeaderCompleto = false;
    public esAgendaOdonto = false;
    public idOrganizacion = this.auth.organizacion.id;
    // ---- Variables asociadas a componentes paciente buscar y paciente listado
    public resultadoBusqueda = null;
    public pacienteSelected = null;
    public loading = false;
    public columns = [
        { key: 'select', label: '' },
        { key: 'primeraVez', label: 'Primera vez' },
        { key: 'estado', label: 'Estado' },
        { key: 'diagSnomed', label: 'Diagnóstico Snomed' },
        { key: 'diagCie10', label: 'Diagnóstico CIE10' }
    ];
    public columnsOdo = [
        { key: 'select', label: '' },
        { key: 'primeraVez', label: 'Primera vez' },
        { key: 'estado', label: 'Estado' },
        { key: 'diagnostico', label: 'Diagnóstico' },
        { key: 'diente', label: 'Diente' },
        { key: 'caras', label: 'Caras' }
    ];

    openedDropDown = null;
    itemsDropdown = [];

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
        this.getCantidadTurnosAsignados();
        this.esAgendaOdonto = this.agenda.tipoPrestaciones[0].term.includes('odonto');
        localStorage.removeItem('revision');
        localStorage.removeItem('verListaTurnos');
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

    cerrarBuscarPaciente() {
        this.pacientesSearch = false;
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
            alias: this.paciente.alias,
            genero: this.paciente.genero,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
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
        if (this.turnoSeleccionado && this.turnoSeleccionado._id === turno._id) {
            this.turnoSeleccionado = null;
        } else {
            this.existeCodificacionProfesional = false;
            this.diagnosticos = [];
            this.paciente = null;
            this.bloqueSeleccionado = bloque;
            this.showReparo = false;
            this.showModifAsistencia = false;
            if (this.bloqueSeleccionado && this.bloqueSeleccionado !== -1) {
                this.turnoTipoPrestacion = this.bloqueSeleccionado.tipoPrestaciones.length === 1 ? this.bloqueSeleccionado.tipoPrestaciones[0] : null;
            } else { // para el caso de sobreturno, que no tiene bloques.
                this.turnoTipoPrestacion = turno.tipoPrestacion;
            }
            this.turnoSeleccionado = turno;
            if (turno.diagnostico.codificaciones && turno.diagnostico.codificaciones.length) {
                this.diagnosticos = this.diagnosticos.concat(turno.diagnostico.codificaciones);
            }
        }
    }

    seleccionarAsistencia(asistencia) {
        if (this.turnoTipoPrestacion) {
            if (this.turnoSeleccionado && asistencia) {
                this.turnoSeleccionado.asistencia = asistencia.id;
            }
            this.onSave();
            this.pacientesSearch = false;
            this.showModifAsistencia = false;
        } else {
            this.plex.info('warning', 'Debe seleccionar un tipo de Prestacion');
        }
    }

    indexSeleccionado(id: string) {
        if (this.turnoSeleccionado) {
            return this.turnoSeleccionado._id === id;
        }
    }

    estaSeleccionado(turno: any) {
        this.showRegistrosTurno = true;
        return (this.turnoSeleccionado === turno);
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

    seleccionarDiagnostico(index: number) {
        if (this.indiceDiagnostico >= 0 && this.indiceDiagnostico === index) {
            this.indiceDiagnostico = -1;
        } else {
            this.indiceDiagnostico = index;
        }
    }

    diagnosticoSeleccionado(index: number) {
        if (this.indiceDiagnostico >= 0) {
            return this.indiceDiagnostico === index;
        }
    }

    borrarDiagnostico() {
        if (this.indiceDiagnostico >= 0) {
            if (!this.diagnosticos[this.indiceDiagnostico].codificacionProfesional ||
                (this.diagnosticos[this.indiceDiagnostico].codificacionProfesional &&
                    this.diagnosticos[this.indiceDiagnostico].codificacionProfesional.snomed &&
                    !this.diagnosticos[this.indiceDiagnostico].codificacionProfesional.snomed.term)) {
                this.diagnosticos.splice(this.indiceDiagnostico, 1);
            } else {
                this.diagnosticos[this.indiceDiagnostico].codificacionAuditoria = null;
            }
            if (this.indiceDiagnostico === 0) {
                this.plex.toast('warning', 'Información', 'El diagnostico principal fue eliminado');
            }
            this.onSave();
            this.indiceDiagnostico = -1;
        }
    }

    puedeAprobar() {
        if (this.indiceDiagnostico >= 0) {
            return ((this.diagnosticos[this.indiceDiagnostico].codificacionProfesional?.snomed?.codigo ||
                this.diagnosticos[this.indiceDiagnostico].codificacionProfesional?.cie10?.codigo) &&
                !this.diagnosticos[this.indiceDiagnostico].codificacionAuditoria?.codigo);
        }
    }

    puedeBorrar(tipo: string) {
        if (this.indiceDiagnostico >= 0) {
            if (tipo === 'd') {
                return !(this.diagnosticos[this.indiceDiagnostico].codificacionProfesional?.snomed?.codigo ||
                    this.diagnosticos[this.indiceDiagnostico].codificacionProfesional?.cie10?.codigo);
            } else {
                return ((this.diagnosticos[this.indiceDiagnostico].codificacionProfesional?.snomed?.codigo ||
                    this.diagnosticos[this.indiceDiagnostico].codificacionProfesional?.cie10?.codigo) &&
                    this.diagnosticos[this.indiceDiagnostico].codificacionAuditoria?.codigo);
            }
        }
    }

    puedeReparar() {
        return this.puedeAprobar();
    }

    aprobar() {
        if (this.indiceDiagnostico >= 0) {
            this.diagnosticos[this.indiceDiagnostico].codificacionAuditoria = this.diagnosticos[this.indiceDiagnostico].codificacionProfesional.cie10;
            // En el caso que aprueben el primer diagnóstico, se aprueba el resto
            if (this.indiceDiagnostico === 0) {
                for (let j = 1; j < this.diagnosticos.length; j++) {
                    this.diagnosticos[j].codificacionAuditoria = this.diagnosticos[j].codificacionProfesional.cie10;
                }
            }
            this.onSave();
        }
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
                ((t.asistencia === 'asistio' && t.tipoPrestacion.auditable === true && !t.diagnostico.codificaciones[0]?.codificacionAuditoria && !t.diagnostico.ilegible)
                    || !t.asistencia)
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
            if (!turnoSinVerificar) {
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
            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => { });
        }
    }

    modificarAsistencia() {
        if (this.turnoSeleccionado) {
            this.showModifAsistencia = true;
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
        const esAuditado = turno && turno.paciente && turno.asistencia && (turno.asistencia === 'noAsistio' || turno.asistencia === 'sinDatos' || !sinAuditorias || turno.tipoPrestacion?.auditable === false);
        return esAuditado;
    }

    asistenciaVerificada(turno) {
        return turno?.asistencia && turno?.asistencia === 'asistio' && !turno?.diagnostico?.codificaciones[0]?.codificacionAuditoria?.codigo && !turno?.diagnostico?.codificaciones[0]?.codificacionProfesional?.snomed?.term && turno.tipoPrestacion?.auditable === true;
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
                this.plex.toast('success', 'El estado del turno fué actualizado');
                this.cerrarAsistencia();
            });
        } else {
            this.plex.info('warning', 'Debe seleccionar un tipo de Prestacion');
        }
    }

    agregarSobreturno() {
        localStorage.setItem('revision', 'true');
        this.showSobreturno = true;
    }

    cerrarSobreturno() {
        this.refresh();
        this.showSobreturno = false;
    }

    codificar() {
        this.showCodificacion = true;
    }

    cerrarCodificar() {
        this.indiceDiagnostico = -1;
        this.showCodificacion = false;
    }

    agregarPaciente() {
        this.showAddPaciente = true;
    }

    cerrarPaciente() {
        this.refresh();
        this.showAddPaciente = false;
    }

    refresh() {
        this.serviceAgenda.getById(this.agenda.id).subscribe(_agenda => {
            this.agenda = _agenda;
        }, err => {
            if (err) {

            }
        });
    }

    volver() {
        this.router.navigate(['citas/auditoria_agendas']);
    }

    mostrarReparo() {
        this.indiceReparo = this.indiceDiagnostico;
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
            this.diagnosticos[this.indiceDiagnostico].codificacionAuditoria = reparo;
            this.showReparo = false;
        }
        this.onSave();
    }

    borrarReparo() {
        this.diagnosticos[this.indiceDiagnostico].codificacionAuditoria = null;
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

    cerrarSidebarRevision() {
        this.cerrarSidebar.emit();
    }

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
                    this.showRegistrosTurno = true;
                });
        } else {
            this.plex.info('warning', 'Paciente no encontrado', '¡Error!');
        }
    }

    setDropDown(drop) {
        if (this.openedDropDown) {
            this.openedDropDown.open = (this.openedDropDown === drop) ? true : false;
        }
        this.openedDropDown = drop;
        this.itemsDropdown = [];
        for (let i = 0; i < this.estadosAsistencia.length; i++) {
            this.itemsDropdown[i] = {
                label: this.estadosAsistencia[i].nombre,
                handler: () => { this.seleccionarAsistencia(this.estadosAsistencia[i]); }
            };
        }
    }

    estadoAgenda(estado: String, dato: String) {
        if (dato === 'n') {
            return this.estadosAgendaArray.find(e => e.id === estado).nombre;
        }
        if (dato === 'c') {
            return this.estadosAgendaArray.find(e => e.id === estado).class;
        }
    }

    class(estado) {
        if (estado !== 'turnoDoble') {
            return 'hover';
        }
    }

}
