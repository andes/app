import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TurnoService } from './../../../services/turnos/turno.service';

@Component({
    selector: 'app-listar-prestamos',
    templateUrl: './listar-prestamos.component.html'
})

export class ListarPrestamosComponent implements OnInit {
    turnos: any[];
    today = Date.now();

    @Output() showDevolverEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

    ngOnInit() {
        this.getTurnos();
    }

    getTurnos() {
        let datosTurno = { estado: 'asignado', userName: '25334392', userDoc: '25334392' };

        this.turnoService.getTurnos(datosTurno).subscribe(turnos => {
            this.turnos = turnos;
        })
    }

    devolver(turno) {
        debugger;
        this.showDevolverEmit.emit(true);
    }

    constructor(public turnoService: TurnoService) { }
}