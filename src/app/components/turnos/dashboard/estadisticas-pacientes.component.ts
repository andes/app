import { Component, Input, OnInit, EventEmitter, Output, OnChanges, SimpleChange } from '@angular/core';
import * as moment from 'moment';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { TurnoService } from '../../../services/turnos/turno.service';
import { Auth } from '@andes/auth';
import { LogPacienteService } from '../../../services/logPaciente.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cache } from '@andes/shared';


@Component({
    selector: 'estadisticas-pacientes',
    templateUrl: 'estadisticas-pacientes.html',
    styleUrls: ['estadisticas-paciente.scss']
})

export class EstadisticasPacientesComponent implements OnInit {
    pacienteFields = ['sexo', 'fechaNacimiento', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];

    historial$: Observable<any[]>;
    turnosPaciente$: Observable<any[]>;
    ultimosTurnos$: Observable<any[]>;


    @Input() showTab: Number = 0;
    @Input() paciente: IPaciente;

    // Inicialización
    constructor(
        public serviceTurno: TurnoService,
        public auth: Auth,
        public serviceLogPaciente: LogPacienteService,
    ) { }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.historial$ = this.serviceTurno.getHistorial({ pacienteId: this.paciente.id }).pipe(
            map(turnos => this.sortByHoraInicio(turnos)),
            cache()
        );
        this.turnosPaciente$ = this.historial$.pipe(
            map(turnos => turnos.filter(t => moment(t.horaInicio).isSameOrAfter(new Date(), 'day') && t.estado !== 'liberado'))
        );
        this.ultimosTurnos$ = this.historial$.pipe(
            map(turnos => turnos.filter(t => moment(t.horaInicio).isSameOrBefore(new Date(), 'day')))
        );
    }

    private sortByHoraInicio(turnos: any[]) {
        return turnos.sort((a, b) => {
            const inia = a.horaInicio ? new Date(a.horaInicio) : null;
            const inib = b.horaInicio ? new Date(b.horaInicio) : null;
            return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
        });
    }
}
