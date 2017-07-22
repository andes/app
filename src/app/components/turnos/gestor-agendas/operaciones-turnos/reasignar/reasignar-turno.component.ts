import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { CalendarioComponent } from './../../../dar-turnos/calendario.component';
import { IAgenda } from './../../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../../services/turnos/agenda.service';
import { TurnoService } from '../../../../../services/turnos/turno.service';
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
    autorizado: any;

    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService, public serviceTurno: TurnoService) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:reasignarTurnos:?').length > 0;
        this.showReasignarTurno = true;
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
                this.turnosSeleccionados.splice(this.turnosSeleccionados.indexOf(turno), 1);
                this.turnosSeleccionados = [... this.turnosSeleccionados];
            } else {
                this.turnosSeleccionados = [... this.turnosSeleccionados, turno];
            }
        }

        this.turnosSeleccionados.sort((a, b) => {
            return (a.horaInicio.getTime() > b.horaInicio.getTime() ? 1 : (b.horaInicio.getTime() > a.horaInicio.getTime() ? -1 : 0));
        });

        // if (this.turnosSeleccionados.length < this.agendaAReasignar.turnos.length) {
        //     this.todos = false;
        // }

        // if (this.turnosSeleccionados.length === this.agendaAReasignar.turnos.length) {
        //     this.todos = true;
        // }

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

    // Lista de agendas similares/candidatas
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

    // Agenda seleccionada de las similares/candidatas
    cargarAgendaDestino(idAgenda, idBloque, idTurno) {

        this.serviceAgenda.getById(idAgenda).subscribe(agendaDestino => {
            this.agendaDestino.agenda = agendaDestino;

            let indiceBloque = agendaDestino.bloques.findIndex(x => x.id === idBloque);
            this.agendaDestino.bloque = agendaDestino.bloques[indiceBloque];

            let indiceTurno = this.agendaDestino.bloque.turnos.findIndex(x => x.id === idTurno);
            this.agendaDestino.turno = agendaDestino.bloques[indiceBloque].turnos[indiceTurno];
        });

    }

    /**
     * Volver al gestor
     */
    cancelar() {
        this.volverAlGestor.emit(true);
        this.showReasignarTurno = false;
    }


}
