import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { TurnoService } from '../../../services/turnos/turno.service';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { cache } from '@andes/shared';

@Component({
    selector: 'estadisticas-pacientes',
    templateUrl: 'estadisticas-pacientes.html',
    styleUrls: ['estadisticas-paciente.scss']
})

export class EstadisticasPacientesComponent implements OnInit {
    pacienteFields = ['sexo', 'edad', 'fechaNacimiento', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    historial$: Observable<any[]>;
    turnosPaciente$: Observable<any[]>;
    listadoTurnos$: Observable<any[]>;
    public turnosPaciente = [];

    @Input() showTab: Number = 0;
    @Input() paciente: IPaciente;
    @Input() demandaInsatisfecha = false;
    @Output() demandaCerrada = new EventEmitter<any>();

    constructor(
        public serviceTurno: TurnoService,
        public auth: Auth,
        public serviceAgenda: AgendaService,
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
            map(turnos => turnos.filter(t => moment(t.horaInicio).isSameOrAfter(new Date(), 'day') && t.estado !== 'liberado')));
    }

    private sortByHoraInicio(turnos: any[]) {
        return turnos.sort((a, b) => {
            const inia = a.horaInicio ? new Date(a.horaInicio) : null;
            const inib = b.horaInicio ? new Date(b.horaInicio) : null;
            return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
        });
    }

    cerrarDemandaInsatisfecha() {
        this.demandaCerrada.emit();
    }

}
