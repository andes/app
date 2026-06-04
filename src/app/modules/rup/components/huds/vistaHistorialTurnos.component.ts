import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { TurnoService } from 'src/app/services/turnos/turno.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'historial-turnos',
    templateUrl: 'vistaHistorialTurnos.html',
})

export class VistaHistorialTurnosComponent implements OnInit {
    @Input() paciente: IPaciente;

    historial = [];
    params;
    scrollEnd = false;
    fetching = false;

    constructor(
        public serviceTurno: TurnoService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.params = {
            pacienteId: this.paciente.id,
            skip: 30,
            limit: 15
        };
        this.getHistorial();
    }

    private getHistorial() {
        if (this.fetching) { return; }
        this.fetching = true;
        if (this.params.skip === 0) {
            this.historial = [];
        }
        this.serviceTurno.getHistorial(this.params).subscribe(
            turnos => {
                const nuevosTurnos = this.sortByHoraInicio(turnos);
                this.historial = this.historial.concat(nuevosTurnos);
                this.params.skip = this.historial.length;
                if (!turnos.length || turnos.length < this.params.limit) {
                    this.scrollEnd = true;
                }
                this.fetching = false;
                this.cd.markForCheck();
            },
            () => { this.fetching = false; }
        );
    }

    public onScroll(event?: any) {
        if (event) {
            const el = event.target;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
                if (!this.scrollEnd) {
                    this.getHistorial();
                }
            }
        } else {
            if (!this.scrollEnd) {
                this.getHistorial();
            }
        }
    }

    private sortByHoraInicio(turnos: any[]) {
        return turnos.sort((a, b) => {
            const inia = a.horaInicio ? moment(a.horaInicio).toDate() : null;
            const inib = b.horaInicio ? moment(b.horaInicio).toDate() : null;
            return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
        });
    }
}
