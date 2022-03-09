import { Component, Input, OnChanges } from '@angular/core';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacientesVacunasService } from '../../../../services/pacientes-vacunas.service';

@Component({
    selector: 'app-aplicaciones-paciente',
    templateUrl: './aplicaciones-paciente.component.html'
})
export class AplicacionesPacienteComponent implements OnChanges {
    @Input() paciente: IPaciente;
    public aplicaciones = [];

    constructor(
        private pacientesVacunasService: PacientesVacunasService
    ) { }

    ngOnChanges() {
        this.pacientesVacunasService.search({ paciente: this.paciente.id }).subscribe((vacunas: any) => {
            this.aplicaciones = vacunas?.length ? vacunas[0].aplicaciones : null;
        });
    }
}
