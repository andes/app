import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { EstadosAgenda } from './../../enums';



@Component({
    selector: 'suspendida',
    templateUrl: 'suspendida.html'
})

export class SuspendidaComponent implements OnInit {

    @Input() agenda: IAgenda;

    constructor(public plex: Plex) { }

    public estadosAgenda = EstadosAgenda;
    public ag;
    public showData = false;
    public turnos = [];
    ngOnInit() {

        this.showData = true;
    }
}
