import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { SmsService } from './../../../services/turnos/sms.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
import { EstadosAgenda } from './../enums';
import * as moment from 'moment';
import { TurnoService } from 'src/app/services/turnos/turno.service';

@Component({
    selector: 'turnos',
    templateUrl: 'turnos.html',
    styleUrls: ['./turnos.scss']
})

export class TurnosComponent implements OnInit {
    // Parámetros
    @Input('agenda')
    set agenda(value: any) {
        this.hoy = new Date();
        this._agenda = value;
        this.delDia = this.agenda?.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate();
        this.turnosSeleccionados = [];
        this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();

        this.arrayDelDia = [];
        this.bloques = this.agenda.bloques;
        let turnoAnterior = null;
        const countBloques = [];
        this.delDiaDisponibles = 0;
        this.programadosDisponibles = 0;
        this.gestionDisponibles = 0;
        this.profesionalDisponibles = 0;

        this.bloques.forEach((bloque, indexBloque) => {
            countBloques.push({
                // Si la agenda es de hoy los programados se suman a los del día
                delDia: this.delDia ? (bloque.restantesDelDia as number) + (bloque.restantesProgramados as number) : bloque.restantesDelDia,
                programado: this.delDia ? 0 : bloque.restantesProgramados,
                gestion: bloque.restantesGestion,
                profesional: bloque.restantesProfesional
            });
            bloque.turnos.forEach((turno) => {
                if (turno.estado === 'turnoDoble' && turnoAnterior) {
                    turno = turnoAnterior;
                }
                turnoAnterior = turno;
            });

            // Acumulado de todos los bloques clasificado x tipo de turno
            this.delDiaDisponibles += countBloques[indexBloque].delDia;
            this.programadosDisponibles += countBloques[indexBloque].programado;
            this.gestionDisponibles += countBloques[indexBloque].gestion;
            this.profesionalDisponibles += countBloques[indexBloque].profesional;
            // contador de turnos por Bloque
            this.countBloques = countBloques;
        });
    }
    get agenda(): any {
        return this._agenda;
    }
    private _agenda: IAgenda;

    @Input() reasturnos: IAgenda;
    @Input() selectable = true; // Permite :hover y click()
    @Input() selected = false;// Muestra efecto de selección
    @Output() reasignaTurno = new EventEmitter<boolean>();
    @Output() recargarAgendas = new EventEmitter<boolean>();
    @Output() recargarBotones = new EventEmitter<boolean>();
    @Output() cerrarSidebar = new EventEmitter<any>();

    // Propiedades públicas
    public idOrganizacion = this.auth.organizacion.id;
    public prestacion;
    public prestacionTerm;
    showSeleccionarTodos = true;
    showTurnos = true;
    showSuspenderTurno = false;
    showAgregarNotaTurno = false;
    showCarpetaPaciente = false;
    smsEnviado: Boolean = false;
    smsLoader: Boolean = false;
    turnos = [];
    turnosSeleccionados: any[] = [];
    turno: ITurno;
    cantSel: number;
    todos = false;
    reasignar: any = {};
    horaInicio: any;
    bloques = [];
    public items = [];
    public mostrar = 0;
    public bloqueSelected;
    hoy: Date;
    botones: any = {}; // Contiene el cálculo de la visualización de botones
    public estadosAgenda = EstadosAgenda;
    public mostrarHeaderCompleto = false;
    public delDia = false;
    public arrayDelDia = [];
    public sortBy: string;
    public sortOrder = 'desc';
    botonera = true;

    public columns = [
        {
            key: 'seleccionar',
            label: '',
        },
        {
            key: 'datosPrincipales',
            label: 'Datos Principales',
            sorteable: true,
            opcional: false,
        },
        {
            key: 'acciones',
            label: 'Acciones',
            sorteable: true,
            opcional: true
        },
    ];

    delDiaDisponibles: number;
    programadosDisponibles: number;
    gestionDisponibles: number;
    profesionalDisponibles: number;
    countBloques: any[];

    // Inicialización
    constructor(
        public plex: Plex,
        public smsService: SmsService,
        public serviceAgenda: AgendaService,
        public listaEsperaService: ListaEsperaService,
        public auth: Auth,
        public serviceTurno: TurnoService) { }

    ngOnInit() {
        const agendaActualizar = this.agenda;
        for (let index = 0; index < this.agenda.bloques.length; index++) {
            this.items.push({ label: 'Bloque ' + (index + 1), key: index });
        }
        this.bloqueSelected = this.agenda.bloques[this.mostrar];
        this.showSeleccionarTodos = (this.bloqueSelected.turnos.length > 0);
    }

    seleccionarTurno(turno, multiple = false, sobreturno) {
        turno.sobreturno = sobreturno;
        if (!multiple) {
            this.turnosSeleccionados = [];
            this.turnosSeleccionados = [...this.turnosSeleccionados, turno];
        } else {
            if (this.turnosSeleccionados.find(x => x.id === turno._id)) {
                this.turnosSeleccionados.splice(this.turnosSeleccionados.indexOf(turno), 1);
                this.turnosSeleccionados = [... this.turnosSeleccionados];
            } else {
                this.turnosSeleccionados = [... this.turnosSeleccionados, turno];
            }
        }

        this.turnosSeleccionados.sort((a, b) => {
            return (a.horaInicio.getTime() > b.horaInicio.getTime() ? 1 : (b.horaInicio.getTime() > a.horaInicio.getTime() ? -1 : 0));
        });
        if (this.turnosSeleccionados.length < this.bloqueSelected.turnos.length) {
            this.todos = false;
        }
        if (this.turnosSeleccionados.length === this.bloqueSelected.turnos.length) {
            this.todos = true;
        }
        this.cantSel = this.turnosSeleccionados.length;
    }

    estaSeleccionado(turno: any) {
        return this.turnosSeleccionados.indexOf(turno) >= 0;
    }

    seleccionarTodos() {
        this.turnosSeleccionados = [];

        this.bloqueSelected.turnos.map(turno => {
            if (!this.todos) {
                turno.checked = true;
                this.turnosSeleccionados = [...this.turnosSeleccionados, turno];
            } else {
                turno.checked = false;
            }
        });

        this.agenda.sobreturnos.map(sobreturno => {
            if (!this.todos) {
                sobreturno.checked = true;
                this.turnosSeleccionados = [...this.turnosSeleccionados, sobreturno];
            } else {
                sobreturno.checked = false;
            }
        });

        this.todos = !this.todos;
        this.cantSel = this.turnosSeleccionados.length;
    }

    // retorna true si algun bloque de la agenda es exclusivo de gestión
    contieneExclusivoGestion(agenda: IAgenda): boolean {
        return agenda.bloques.some(bloque => bloque.reservadoGestion > 0 && bloque.accesoDirectoDelDia === 0 && bloque.accesoDirectoProgramado === 0 && bloque.reservadoProfesional === 0);
    }

    suspenderTurno() {
        this.showTurnos = false;
        this.showSuspenderTurno = true;
    }

    agregarNotaTurno() {
        this.showTurnos = false;
        this.showAgregarNotaTurno = true;
    }

    editarCarpetaPaciente() {
        this.showTurnos = false;
        this.showCarpetaPaciente = true;
    }

    // Se usa tanto para guardar como cancelar
    afterComponenteCarpeta(carpetas) {
        // Siempre es 1 sólo el seleccionado cuando se edita una carpeta
        if (carpetas) {
            this.turnosSeleccionados[0].paciente.carpetaEfectores = carpetas;
            this.serviceTurno.patch(
                this.agenda.id,
                this.bloqueSelected.id,
                this.turnosSeleccionados[0].id,
                { carpetaEfectores: carpetas }
            ).subscribe();
        }
        this.showCarpetaPaciente = false;
        this.showTurnos = true;
        this.bloqueSelected = this.agenda.bloques[this.mostrar];
    }

    eventosTurno(operacion) {
        const patch: any = {
            op: operacion,
            turnos: this.turnosSeleccionados.map((resultado) => {
                return resultado.id;
            })
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
            this.agenda.bloques = resultado.bloques;
            this.bloqueSelected = this.agenda.bloques[this.mostrar];
        });

        // Reset botones y turnos seleccionados
        this.turnosSeleccionados = [];
        this.turnos.forEach((turno) => {
            turno.checked = false;
        });
        this.todos = false;
    }

    reasignarTurno(paciente: any, idTurno: any, idAgenda: any) {
        this.reasignar = { 'paciente': paciente, 'idTurno': idTurno, 'idAgenda': idAgenda };
        this.reasignaTurno.emit(this.reasignar);
    }

    reasignarTurnoLiberado(turnoLiberado) {
        this.reasignar = { 'paciente': turnoLiberado.paciente, 'idTurno': turnoLiberado.idTurno, 'idAgenda': turnoLiberado.idAgenda };
        this.reasignaTurno.emit(this.reasignar);
    }

    reasignarTurnoSuspendido(turnoSuspendido) {
        this.reasignar = { 'paciente': turnoSuspendido.paciente, 'idTurno': turnoSuspendido.idTurno, 'idAgenda': turnoSuspendido.idAgenda };
        this.reasignaTurno.emit(this.reasignar);
    }

    asignarTurnoDoble(operacion) {
        let turnoSeleccionado;
        let index;
        const turnosActualizar = [];
        let bloqueTurno;
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            // Se busca la posición del turno y se obtiene el siguiente
            turnoSeleccionado = this.turnosSeleccionados[x];
            bloqueTurno = this.bloques.find(bloque => (bloque.turnos.findIndex(t => (t._id === turnoSeleccionado._id)) >= 0));

            if (bloqueTurno) {
                index = bloqueTurno.turnos.findIndex(t => {
                    return t._id === turnoSeleccionado._id;
                });
                if ((index > -1) && (index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado === 'disponible')) {
                    turnosActualizar.push(bloqueTurno.turnos[index + 1]);
                } else {
                    // en el caso que el turno siguiente no se encuentre disponible
                    this.plex.info('warning', 'No se puede asignar el turno doble');
                }
            }
        }

        const patch: any = {
            op: operacion,
            turnos: turnosActualizar.map((resultado) => {
                return resultado.id;
            })
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
            this.agenda.bloques = resultado.bloques;
            this.bloqueSelected = this.agenda.bloques[this.mostrar];
        });

        // Reset botones y turnos seleccionados
        this.turnosSeleccionados = [];
        this.turnos.forEach((turno, index) => {
            turno.checked = false;
        });
        this.todos = false;

    }

    agregarPacienteListaEspera(agenda: any) {
        let patch: any = {};
        let pacienteListaEspera = {};

        pacienteListaEspera = this.turnosSeleccionados;

        patch = {
            'op': 'listaEsperaSuspensionAgenda',
            'idAgenda': agenda.id,
            'pacientes': pacienteListaEspera
        };

        // Bag of cats
        this.listaEsperaService.postXIdAgenda(agenda.id, patch).subscribe(resultado => {
            this.agenda = resultado;
            this.plex.info('warning', 'El paciente pasó a Lista de Espera');
        });
    }

    cambiarADisponible() {
        this.plex.confirm('¿Está seguro que quiere pasar el/los turno/s a disponible?', 'Turno disponible').then(respuesta => {
            if (respuesta) {
                this.pasarADisponible();

            }
        });

    }

    pasarADisponible() {
        let alertCount = 0;
        this.turnosSeleccionados.forEach((index) => {

            const patch = {
                'op': 'liberarTurno',
                'turnos': this.turnosSeleccionados.map(resultado => resultado._id)
            };
            this.serviceAgenda.patch(this.agenda.id, patch).subscribe({
                next: resultado => {
                    this.saveLiberarTurno(this.agenda);
                    if (alertCount === 0) {
                        if (this.turnosSeleccionados.length === 1) {
                            this.plex.toast('success', 'El turno seleccionado fue cambiado a disponible.');
                        } else {
                            this.plex.toast('success', 'Los turnos seleccionados fueron cambiados a disponible.');
                        }
                        alertCount++;
                    }

                    this.agenda = resultado;
                    if (index === this.turnosSeleccionados.length - 1) {
                        this.saveLiberarTurno(this.agenda);
                    }
                },
                error: err => {
                    if (err) {
                        this.plex.info('warning', 'Turno en ejecución', 'Error');
                        this.cancelaLiberarTurno();
                    }
                }
            });
        });
    }

    saveLiberarTurno(agenda: any) {
        this.serviceAgenda.getById(agenda.id).subscribe(ag => {
            this.agenda = ag;
            this.showTurnos = true;
            this.bloqueSelected = this.agenda.bloques[this.mostrar];
        });
    }

    cancelaLiberarTurno() {
        this.turnosSeleccionados.length = 0;
        this.showTurnos = true;
    }

    saveSuspenderTurno() {
        this.serviceAgenda.getById(this.agenda.id).subscribe(ag => {
            this.agenda = ag;
            this.showTurnos = true;
            this.showSuspenderTurno = false;
            this.recargarAgendas.emit(true);
            this.recargarBotones.emit(true);
            this.bloqueSelected = this.agenda.bloques[this.mostrar];
        });
    }

    saveAgregarNotaTurno() {
        this.serviceAgenda.getById(this.agenda.id).subscribe(ag => {
            this.agenda = ag;
            this.turnosSeleccionados = [];

            this.showTurnos = true;
            this.showAgregarNotaTurno = false;
            this.turnos.forEach((turno, index) => {
                turno.checked = false;
            });
            this.bloqueSelected = this.agenda.bloques[this.mostrar];
            this.todos = false;
        });
    }

    cambiarOpcion(opcion) {
        this.prestacion = '';
        this.mostrar = opcion;
        this.bloqueSelected = this.agenda.bloques[opcion];
        this.bloqueSelected.tipoPrestaciones.forEach(prest => this.prestacion = this.prestacion.concat(prest.term + ' - '));
        this.prestacionTerm = this.prestacion.slice(0, -2);
        this.todos = false;
    }

    cerrarSidebarTurnos() {
        this.cerrarSidebar.emit();
    }
}
