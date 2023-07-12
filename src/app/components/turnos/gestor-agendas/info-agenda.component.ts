import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IAgenda } from '../../../interfaces/turnos/IAgenda';
import * as moment from 'moment';
@Component({
    selector: 'info-agenda',
    templateUrl: 'info-agenda.html',
    styleUrls: ['./turnos.scss']
})
export class InfoAgendaComponent {
    @Output() volver = new EventEmitter();
    @Input('agenda')
    set agenda(value: any) {
        this.hoy = new Date();
        this._agenda = value;
        this.delDia = this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate();
        this.turnosSeleccionados = [];
        this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();
        this.arrayDelDia = [];
    }
    get agenda(): any {
        return this._agenda;
    }
    private _agenda: IAgenda;
    agendasSeleccionadas: IAgenda[] = [];
    showSeleccionarTodos = true;
    turnosSeleccionados: any[] = [];
    horaInicio: any;
    public items = [];
    public mostrar = 0;
    hoy: Date;
    public delDia = false;
    public arrayDelDia = [];

    public volverAtras() {
        this.volver.emit();
    }
}
