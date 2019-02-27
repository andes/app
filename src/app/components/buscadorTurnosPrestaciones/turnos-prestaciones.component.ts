import { Plex } from '@andes/plex';
import { Component, OnInit, Output } from '@angular/core';
import { TurnosPrestacionesService } from './services/turnos-prestaciones.service';
import { PacienteBuscarResultado } from '../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { IPaciente } from '../../interfaces/IPaciente';

@Component({
    selector: 'turnos-prestaciones',
    templateUrl: 'turnos-prestaciones.html',
})

export class TurnosPrestacionesComponent implements OnInit {
    private busquedas;
    constructor(
        private auth: Auth,
        private turnosPrestacionesService: TurnosPrestacionesService,
    ) { }
    ngOnInit() {
        let parametros = {
            fechaDesde: new Date('2019-02-18T03:00:00.000Z'),
            fechaHasta: new Date('2019-02-20T02:59:59.999Z')
        };
        this.turnosPrestacionesService.get(parametros).subscribe((data) => {
            this.busquedas = data;
        });
    }
}
