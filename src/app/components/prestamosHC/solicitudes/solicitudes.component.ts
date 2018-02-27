import { Component, OnInit } from '@angular/core';
import { TurnoService } from './../../../services/turnos/turno.service';

@Component({
    selector: 'app-solicitudes',
    templateUrl: './solicitudes.component.html'
})

export class SolicitudesComponent implements OnInit {
turnos: any[];

    ngOnInit() {
        this.getTurnos();
    }

    getTurnos() {
        let datosTurno = { estado: 'asignado', userName: '25334392', userDoc: '25334392' };

        this.turnoService.getTurnos(datosTurno).subscribe(turnos => {
            debugger;
            this.turnos = turnos;
        })
    }

    constructor(public turnoService: TurnoService) { }
}