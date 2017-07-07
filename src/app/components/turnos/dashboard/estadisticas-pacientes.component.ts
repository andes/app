import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';
import * as calculos from './../../../utils/calculosDashboard';
import { IPaciente } from './../../../interfaces/IPaciente';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';

@Component({
    selector: 'estadisticas-pacientes',
    templateUrl: 'estadisticas-pacientes.html'
})

export class EstadisticasPacientesComponent implements OnInit {

    @Input('paciente') paciente: IPaciente;

    public fechaDesde: any;
    public fechaHasta: any;
    turnosOtorgados = 125;

    // Inicialización
    constructor(public serviceTurno: TurnoService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        // Se cargan los datos calculados
        let hoy = {
            fechaDesde: moment().startOf('day').format(),
            fechaHasta: moment().endOf('day').format()
        };
        this.fechaDesde = new Date(hoy.fechaDesde);
        this.fechaHasta = new Date(hoy.fechaHasta);

    }

}
