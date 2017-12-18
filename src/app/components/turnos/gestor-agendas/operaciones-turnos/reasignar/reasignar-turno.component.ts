import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { CalendarioComponent } from './../../../dar-turnos/calendario.component';
import { IAgenda } from './../../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../../services/turnos/turno.service';
import { TiposDeTurnos } from './../../../enums';
// import { SmsService } from './../../../../../services/turnos/sms.service';
import * as moment from 'moment';

@Component({
    selector: 'reasignar-turno',
    templateUrl: 'reasignar-turno.html'
})

export class ReasignarTurnoComponent implements OnInit {
    // Guarda si están todos los Turnos seleccionados o no
    todos = false;
    datosAgenda: {
        idAgenda: any;
        idBloque: any;
        idTurno: any;
    };
    showReasignarTurno: boolean;
    agendasSimilares: IAgenda[];
    agendaDestino: any = {};
    smsActivo = false;

    private _agendaAReasignar: any;

    @Input('agendaAReasignar')
    set agendaAReasignar(value: any) {
        this._agendaAReasignar = value;
    }
    get agendaAReasignar(): any {
        return this._agendaAReasignar;
    }
    @Output() saveSuspenderTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoSuspendido = new EventEmitter<boolean>();
    @Output() cancelaSuspenderTurno = new EventEmitter<boolean>();
    @Output() volverAlGestor = new EventEmitter<boolean>();

    public turnoAReasignar: ITurno;

    turnosSeleccionados: any[] = [];

    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };
    public seleccionadosSMS = [];
    public suspendio = false;
    public autorizado: any;
    private permisosRequeridos = 'reasignarTurnos';

    public tiposDeTurnos = TiposDeTurnos;


    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService, public serviceTurno: TurnoService) { }

    ngOnInit() {
        this.autorizado = this.auth.check('turnos:' + this.permisosRequeridos);
        this.showReasignarTurno = true;
        this.actualizar();
    }

    actualizar() {
        this.serviceAgenda.getById(this.agendaAReasignar.id).subscribe(agendaActualizada => {
            this.agendaAReasignar = agendaActualizada;
        });
    }

    estaSeleccionado(turno: any) {
        return this.turnosSeleccionados.indexOf(turno) >= 0;
    }

    seleccionarTurno(turno, bloque, multiple = false) {
        if (!multiple) {
            this.turnosSeleccionados = [];
            this.turnosSeleccionados = [...this.turnosSeleccionados, turno];
        } else {
            if (this.turnosSeleccionados.find(x => x.id === turno._id)) {
                // this.turnosSeleccionados.splice(this.turnosSeleccionados.indexOf(turno), 1);
                delete this.turnosSeleccionados[this.turnosSeleccionados.indexOf(turno)];
                this.turnosSeleccionados = [... this.turnosSeleccionados];
            } else {
                this.turnosSeleccionados = [... this.turnosSeleccionados, turno];
            }
        }

        this.turnosSeleccionados.sort((a, b) => {
            return (a.horaInicio.getTime() > b.horaInicio.getTime() ? 1 : (b.horaInicio.getTime() > a.horaInicio.getTime() ? -1 : 0));
        });

        let idAgenda, idBloque, idTurno;

        // Si es un turno ya reasignado cargamos la agenda a la cual se reasignó
        if (typeof turno.reasignado !== 'undefined' && turno.reasignado.siguiente) {
            this.cargarAgendaDestino(turno.reasignado.siguiente.idAgenda, turno.reasignado.siguiente.idBloque, turno.reasignado.siguiente.idTurno);
        } else {
            idAgenda = this.agendaAReasignar.id;
            idBloque = bloque.id;
            idTurno = turno.id;
            this.cargarAgendasSimilares(idAgenda, idBloque, idTurno);
        }

    }

    // 1. Lista de agendas similares/candidatas
    cargarAgendasSimilares(idAgendaAReasignar, idBloque, idTurno) {
        let params = {
            idAgenda: idAgendaAReasignar,
            idBloque: idBloque,
            idTurno: idTurno
        };

        // Datos de referencia de la agenda origen para pasar al componente hijo (reasignar-turno-agendas)
        this.datosAgenda = params;

        this.serviceAgenda.findCandidatas(params).subscribe((agendas) => {
            this.agendasSimilares = agendas;
        });
    }

    // 2. Agenda seleccionada de las similares/candidatas
    cargarAgendaDestino(idAgenda, idBloque, idTurno) {
        this.serviceAgenda.getById(idAgenda).subscribe(agendaDestino => {
            this.agendaDestino.agenda = agendaDestino;

            let indiceBloque = agendaDestino.bloques.findIndex(x => x.id === idBloque);
            this.agendaDestino.bloque = agendaDestino.bloques[indiceBloque];

            let indiceTurno = this.agendaDestino.bloque.turnos.findIndex(x => x.id === idTurno);
            this.agendaDestino.turno = agendaDestino.bloques[indiceBloque].turnos[indiceTurno];
        });
    }

    reasignacionManualAgendas(event) {
        if (event && this.agendaAReasignar.length) {
            let turnoReasignado = this.agendaAReasignar.map(b => b.map(t => t.id === event.turno.id))[0];
            this.seleccionarTurno(turnoReasignado, event.bloque, false);
        }
    }

    /**
     * Volver al gestor
     */
    cancelar() {
        this.volverAlGestor.emit(true);
        this.showReasignarTurno = false;
    }


}
