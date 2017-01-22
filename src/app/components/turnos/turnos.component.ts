import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { IBloque } from './../../interfaces/turnos/IBloque';
import { Plex } from 'andes-plex/src/lib/core/service';

@Component({
    selector: 'turnos',
    templateUrl: 'turnos.html'
})

export class TurnosComponent implements OnInit {

    constructor(public plex: Plex) { }

    showTurnos: boolean = true;

    // public modelo: any = {};
    // private _agenda: any;
    // public turnos: ITurno[];
    // public bloques: IBloque[];

    @Input() ag: IAgenda;
    
    ngOnInit() {
        // this.verAgenda(this.ag);
    }

    // verAgenda(agenda) {
    //     // agenda = this.agen;
    //     debugger;
    //     var fecha = new Date(agenda.horaInicio);
    //     var horaFin = new Date(agenda.horaFin);
    //     this.modelo = {
    //         fecha: fecha.getDate() + '/' + fecha.getMonth() + '/' + fecha.getFullYear(),
    //         horaInicio: fecha.getHours() + ':' + (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes(),
    //         horaFin: horaFin.getHours() + ':' + (horaFin.getMinutes() < 10 ? '0' : '') + horaFin.getMinutes(),
    //         profesionales: agenda.profesionales,
    //         prestaciones: agenda.prestaciones,
    //         espacioFisico: agenda.espacioFisico.nombre,
    //         bloques: agenda.bloques
    //     };

    //     this.agenda = agenda;       

    //     this.bloques = agenda.bloques;
    // }

    // set agenda(value: IAgenda) {
    //     this._agenda = value;

    // }
}