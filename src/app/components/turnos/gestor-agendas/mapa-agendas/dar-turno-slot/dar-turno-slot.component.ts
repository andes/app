import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';
import { IServicioIntermedio } from 'src/app/interfaces/IServicioIntermedio';
import { ITipoPrestacion } from 'src/app/interfaces/ITipoPrestacion';
import { IAgenda } from 'src/app/interfaces/turnos/IAgenda';
import { IBloque } from 'src/app/interfaces/turnos/IBloque';
import { ITurno } from 'src/app/interfaces/turnos/ITurno';
import { PacienteBuscarResultado } from 'src/app/modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { ISnomedConcept } from 'src/app/modules/rup/interfaces/snomed-concept.interface';
import { resolverProcedimientosOpciones } from 'src/app/components/turnos/utils/procedimiento-servicio-intermedio.util';
import { AgendaEnSlot, DatosTurnoForm, SeleccionTurno, SlotSeleccionado } from './dar-turno-slot.interface';
import { DarTurnoSlotService } from './dar-turno-slot.service';
import {
    ContadoresBloque,
    contadoresBloque,
    filtrarAgendasPorPermiso,
    filtrarBloques,
    tipoTurnoParaAgenda,
    turnoIntersecaSlot,
    turnosEnSlot,
} from './slot-turnos.util';

/**
 * Dar turno desde un slot del mapa de agendas.
 *
 * Una sola vista con scroll (misma forma que `dar-turnos`): paciente, selector de agenda,
 * horarios y campos. No hay pasos: la única condición es tener un paciente elegido.
 */
@Component({
    selector: 'dar-turno-slot',
    templateUrl: './dar-turno-slot.component.html',
    styleUrls: ['./dar-turno-slot.component.scss'],
})
export class DarTurnoSlotComponent implements OnInit {
    @Input() slot: SlotSeleccionado;
    @Input() servicioIntermedio: IServicioIntermedio | null;
    @Input() prestacionesTurnos: string[] = [];

    @Output() cerrar = new EventEmitter<void>();
    @Output() guardado = new EventEmitter<void>();

    readonly pacienteFields = ['financiador', 'numeroAfiliado', 'telefono'];
    readonly lenNota = 140;

    /** Paso 1 (único bloqueante): sin paciente no se muestran agendas ni campos. */
    paciente: IPaciente = null;

    agendas: AgendaEnSlot[] = [];
    cargandoAgendas = false;
    cargandoAgenda = false;
    agendasVaciasPorPermisos = false;
    indice = 0;

    agenda: IAgenda = null;
    condicionLlave = false;
    tipoTurno: 'delDia' | 'programado' | 'gestion' = 'programado';
    bloques: IBloque[] = [];
    contadores: ContadoresBloque[] = [];
    seleccion: SeleccionTurno = null;

    modelo: DatosTurnoForm = this.modeloVacio();
    guardando = false;
    errores: string[] = [];

    serviciosIntermedios: IServicioIntermedio[] = [];
    procedimientosOpciones: ISnomedConcept[] = [];
    mostrarSelectProcedimiento = false;

    constructor(
        private service: DarTurnoSlotService,
        private pacienteService: PacienteService,
        private plex: Plex,
    ) { }

    ngOnInit(): void {
        this.service.serviciosIntermedios().subscribe((lista) => {
            this.serviciosIntermedios = lista ?? [];
        });
    }

    // ---------------------------------------------------------------- agenda

    get agendaSeleccionada(): AgendaEnSlot {
        return this.agendas[this.indice] ?? null;
    }

    get hayAnterior(): boolean {
        return this.indice > 0;
    }

    get haySiguiente(): boolean {
        return this.indice < this.agendas.length - 1;
    }

    get totalTurnosEnSlot(): number {
        return this.agendaSeleccionada?.turnos?.length ?? 0;
    }

    get tipoTurnoTexto(): string {
        switch (this.tipoTurno) {
            case 'delDia':
                return 'Turno del día';
            case 'gestion':
                return 'Turno con llave';
            default:
                return 'Turno programado';
        }
    }

    get hayTurnosVisibles(): boolean {
        return (this.bloques ?? []).some((bloque) => this.tieneTurnos(bloque));
    }

    /** Tipos de prestación del bloque elegido (o de todos los visibles si todavía no hay turno). */
    get tiposPrestacionDisponibles(): ITipoPrestacion[] {
        const bloques = this.seleccion ? [this.seleccion.bloque] : (this.bloques ?? []);
        const distintos = new Map<string, ITipoPrestacion>();
        bloques.forEach((bloque) => {
            (bloque?.tipoPrestaciones ?? []).forEach((tipo) => {
                const id = tipo?.id ?? tipo?._id ?? tipo?.conceptId;
                if (id && !distintos.has(id)) {
                    distintos.set(id, tipo);
                }
            });
        });
        return Array.from(distintos.values());
    }

    /** Mismo criterio que `dar-turnos`: el select aparece si el turno no trae tipo o el bloque ofrece varios. */
    get mostrarSelectTipoPrestacion(): boolean {
        if (!this.seleccion) {
            return false;
        }
        return !this.modelo?.tipoPrestacion || this.tiposPrestacionDisponibles.length > 1;
    }

    get puedeConfirmar(): boolean {
        return !this.guardando && !!this.seleccion && !!this.modelo?.tipoPrestacion;
    }

    anterior(): void {
        this.irAAgenda(this.indice - 1);
    }

    siguiente(): void {
        this.irAAgenda(this.indice + 1);
    }

    irAAgenda(indice: number): void {
        if (indice < 0 || indice >= this.agendas.length) {
            return;
        }
        this.indice = indice;
        this.cargarAgenda(this.agendas[indice]);
    }

    // --------------------------------------------------------------- paciente

    searchEnd(resultado: PacienteBuscarResultado): void {
        if (resultado?.err) {
            this.plex.info('danger', resultado.err);
        }
    }

    onPaciente(p: IPaciente): void {
        if (!p?.id) {
            return;
        }
        this.pacienteService.checkFallecido(p);
        this.limpiarTodo();

        this.service
            .cargarPaciente(p.id)
            .pipe(
                tap((paciente) => {
                    this.paciente = paciente;
                    this.modelo = { ...this.modelo, telefono: this.telefonoPaciente() };
                }),
                switchMap((paciente) =>
                    this.service.reglasPaciente(paciente.id).pipe(
                        tap((llave) => {
                            this.condicionLlave = llave;
                        }),
                    ),
                ),
                switchMap(() => this.cargarAgendas$()),
            )
            .subscribe({
                next: () => {
                    this.irAAgenda(0);
                },
                error: () => {
                    this.plex.info('danger', 'No se pudo cargar el paciente.');
                },
            });
    }

    cambiarPaciente(): void {
        this.paciente = null;
        this.limpiarTodo();
    }

    cargarAgendas$(): Observable<AgendaEnSlot[]> {
        this.cargandoAgendas = true;
        this.agendasVaciasPorPermisos = false;
        this.agendas = [];
        this.indice = 0;
        return this.service.agendasEnSlot(this.slot, this.servicioIntermedio).pipe(
            tap((lista) => {
                const antesFiltro = lista.length;
                this.agendas = filtrarAgendasPorPermiso(lista, this.prestacionesTurnos);
                this.agendasVaciasPorPermisos = antesFiltro > 0 && this.agendas.length === 0;
            }),
            finalize(() => {
                this.cargandoAgendas = false;
            }),
        );
    }

    private cargarAgenda(item: AgendaEnSlot): void {
        this.limpiarSeleccion();
        this.cargandoAgenda = true;

        this.service.agendaCompleta(item.agenda.id).subscribe({
            next: (agenda) => {
                if (agenda.estado !== 'publicada' && agenda.estado !== 'disponible') {
                    this.agenda = null;
                    this.bloques = [];
                    this.contadores = [];
                    this.plex.info('warning', 'Esta agenda ya no está disponible.');
                    return;
                }

                this.agenda = agenda;
                this.condicionLlave = item.condicionLlave;
                this.tipoTurno = tipoTurnoParaAgenda(agenda, this.condicionLlave);

                const esHoy = moment(agenda.horaInicio).isSame(moment(), 'day');
                this.bloques = filtrarBloques(
                    agenda,
                    esHoy,
                    this.tipoTurno,
                    this.condicionLlave,
                    this.prestacionesTurnos,
                );
                this.contadores = this.bloques.map((bloque) => contadoresBloque(bloque, esHoy));
                this.modelo.link = agenda.link ?? '';
                this.errores = [];

                this.sugerirTipoPrestacion();
                this.preseleccionarTurnoEnSlot();
                this.actualizarProcedimientos();
            },
            error: () => {
                this.agenda = null;
                this.bloques = [];
                this.contadores = [];
                this.plex.info('danger', 'No se pudo cargar la agenda.');
            },
        }).add(() => {
            this.cargandoAgenda = false;
        });
    }

    private recargarAgenda(): void {
        if (!this.agendaSeleccionada) {
            return;
        }
        this.cargarAgenda(this.agendaSeleccionada);
    }

    // ---------------------------------------------------------------- turnos

    tieneTurnos(bloque: IBloque): boolean {
        return bloque?.turnos?.some((turno) => turno.estado === 'disponible') ?? false;
    }

    indiceEnAgenda(bloque: IBloque): number {
        return this.agenda?.bloques?.indexOf(bloque) ?? -1;
    }

    esSeleccionado(bloque: IBloque, turno: ITurno): boolean {
        if (!this.seleccion?.turno) {
            return false;
        }
        const mismoBloque =
            this.seleccion.bloque === bloque ||
            this.seleccion.indiceBloque === this.indiceEnAgenda(bloque);
        const mismoTurno =
            this.seleccion.turno._id === turno._id ||
            this.seleccion.turno.id === turno.id;
        return mismoBloque && mismoTurno;
    }

    turnoEnSlot(bloque: IBloque, turno: ITurno): boolean {
        if (!this.slot) {
            return false;
        }
        return turnoIntersecaSlot(turno, bloque, this.slot);
    }

    elegirTurno(bloque: IBloque, indiceBloque: number, turno: ITurno, indiceTurno: number): void {
        if (turno.estado !== 'disponible') {
            return;
        }
        this.seleccion = { bloque, indiceBloque, turno, indiceTurno };
        this.errores = [];
        this.ajustarTipoPrestacion(this.seleccion);
        this.actualizarProcedimientos();
    }

    // ---------------------------------------------------------------- campos

    onFinanciador(financiador: IObraSocial): void {
        this.modelo = { ...this.modelo, financiador };
    }

    onMotivoConsultaChange(motivoConsulta: string): void {
        this.modelo = { ...this.modelo, motivoConsulta };
    }

    onTelefonoChange(telefono: string): void {
        this.modelo = { ...this.modelo, telefono };
    }

    onTipoPrestacionChange(tipo: ITipoPrestacion): void {
        let procedimiento = this.modelo?.procedimiento;
        if (!tipo?.conceptId) {
            procedimiento = undefined;
        }
        this.modelo = {
            ...this.modelo,
            tipoPrestacion: tipo,
            procedimiento,
            videoConferencia: tipo?.videoConferencia ? this.modelo?.videoConferencia : false,
        };
        this.actualizarProcedimientos();
    }

    onProcedimientoChange(procedimiento: ISnomedConcept): void {
        this.modelo = { ...this.modelo, procedimiento };
    }

    onNotaChange(nota: string): void {
        const recortada = nota && nota.length > this.lenNota ? nota.substring(0, this.lenNota) : (nota ?? '');
        this.modelo = { ...this.modelo, nota: recortada };
    }

    onLinkChange(link: string): void {
        this.modelo = { ...this.modelo, link };
    }

    onTurnoTelefonicoChange(turnoTelefonico: boolean): void {
        this.modelo = { ...this.modelo, turnoTelefonico };
    }

    onVideoConferenciaChange(videoConferencia: boolean): void {
        this.modelo = { ...this.modelo, videoConferencia };
    }

    mostrarTurnoTelefonico(): boolean {
        return !!this.agenda?.nominalizada;
    }

    // --------------------------------------------------------------- guardado

    confirmar(): void {
        this.errores = this.validar();
        if (this.errores.length) {
            return;
        }

        this.guardando = true;
        const turno = this.seleccion.turno;
        const bloque = this.seleccion.bloque;

        this.service
            .guardarTurno({
                idAgenda: this.agenda.id,
                idTurno: turno.id ?? (turno as { _id?: string })._id,
                idBloque: bloque.id ?? (bloque as { _id?: string })._id,
                paciente: this.paciente,
                telefono: this.modelo.telefono,
                financiador: this.modelo.financiador,
                tipoPrestacion: this.modelo.tipoPrestacion,
                tipoTurno: this.tipoTurno,
                datos: this.modelo,
            })
            .pipe(finalize(() => {
                this.guardando = false;
            }))
            .subscribe({
                next: () => {
                    this.plex.toast('success', 'El turno se asignó correctamente');
                    this.guardado.emit();
                },
                error: (err) => {
                    if (err === 'noDisponible') {
                        this.plex.info('danger', 'Ese turno ya no está disponible.');
                        this.recargarAgenda();
                        return;
                    }
                    const mensaje = typeof err === 'string' ? err : 'No se pudo asignar el turno';
                    this.errores = [mensaje];
                },
            });
    }

    cerrarFlujo(): void {
        this.cerrar.emit();
    }

    // --------------------------------------------------------------- privados

    private validar(): string[] {
        const mensajes: string[] = [];
        if (!this.seleccion) {
            mensajes.push('Seleccione un horario');
        }
        if (!this.modelo?.tipoPrestacion) {
            mensajes.push('Seleccione un tipo de prestación');
        }
        return mensajes;
    }

    private modeloVacio(): DatosTurnoForm {
        return {
            tipoPrestacion: undefined,
            procedimiento: undefined,
            motivoConsulta: '',
            nota: '',
            telefono: '',
            financiador: undefined,
            link: '',
            videoConferencia: false,
            turnoTelefonico: false,
        };
    }

    /** Conserva texto y cobertura ya cargados; descarta lo que depende de la agenda. */
    private limpiarSeleccion(): void {
        this.seleccion = null;
        this.modelo = {
            ...this.modelo,
            tipoPrestacion: undefined,
            procedimiento: undefined,
            link: '',
            videoConferencia: false,
        };
        this.procedimientosOpciones = [];
        this.mostrarSelectProcedimiento = false;
    }

    private limpiarTodo(): void {
        this.agendas = [];
        this.indice = 0;
        this.agenda = null;
        this.condicionLlave = false;
        this.tipoTurno = 'programado';
        this.bloques = [];
        this.contadores = [];
        this.errores = [];
        this.seleccion = null;
        this.modelo = { ...this.modeloVacio(), telefono: this.telefonoPaciente() };
        this.procedimientosOpciones = [];
        this.mostrarSelectProcedimiento = false;
    }

    private sugerirTipoPrestacion(): void {
        const tipos = this.tiposPrestacionDisponibles;
        if (tipos.length === 1) {
            this.modelo.tipoPrestacion = tipos[0];
            return;
        }
        const vigente = this.modelo?.tipoPrestacion;
        if (vigente && !tipos.some((tipo) => tipo.conceptId === vigente.conceptId)) {
            this.modelo.tipoPrestacion = undefined;
        }
    }

    private preseleccionarTurnoEnSlot(): void {
        const candidatos = turnosEnSlot(this.agenda, this.slot);
        const elegido = candidatos.find((c) => {
            const bloqueAgenda = this.agenda.bloques[c.indiceBloque];
            return bloqueAgenda && this.bloques.includes(bloqueAgenda) && c.turno.estado === 'disponible';
        });

        if (!elegido) {
            this.seleccion = null;
            return;
        }
        this.seleccion = {
            bloque: this.agenda.bloques[elegido.indiceBloque],
            indiceBloque: elegido.indiceBloque,
            turno: elegido.turno,
            indiceTurno: elegido.indiceTurno,
        };
        this.ajustarTipoPrestacion(this.seleccion);
    }

    private ajustarTipoPrestacion(sel: SeleccionTurno): void {
        const bloque = sel.bloque;
        if (bloque.tipoPrestaciones?.length === 1) {
            this.modelo.tipoPrestacion = bloque.tipoPrestaciones[0];
            sel.turno.tipoPrestacion = bloque.tipoPrestaciones[0];
        } else if (sel.turno.tipoPrestacion) {
            this.modelo.tipoPrestacion = sel.turno.tipoPrestacion;
        }
    }

    private serviciosParaProcedimiento(): IServicioIntermedio[] {
        const catalogo = this.serviciosIntermedios ?? [];
        if (!this.servicioIntermedio) {
            return catalogo;
        }
        const id = this.servicioIntermedio.id ?? this.servicioIntermedio._id;
        if (!id) {
            return catalogo;
        }
        return catalogo.filter((servicio) => servicio.id === id || servicio._id === id);
    }

    private actualizarProcedimientos(): void {
        const { procedimientosOpciones, mostrarSelect } = resolverProcedimientosOpciones(
            this.serviciosParaProcedimiento(),
            this.modelo?.tipoPrestacion,
        );
        this.procedimientosOpciones = procedimientosOpciones;
        this.mostrarSelectProcedimiento = mostrarSelect;

        const procedimiento = this.modelo?.procedimiento;
        if (!mostrarSelect) {
            this.modelo.procedimiento = undefined;
        } else if (
            procedimiento?.conceptId
            && !procedimientosOpciones.some((p) => p.conceptId === procedimiento.conceptId)
        ) {
            this.modelo.procedimiento = undefined;
        }
    }

    private telefonoPaciente(): string {
        return this.paciente?.contacto?.find((c) => c.tipo === 'celular')?.valor ?? '';
    }
}
