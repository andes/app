import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { IngresoPacienteService } from './ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-elegir-paciente',
    templateUrl: './elegir-paciente.component.html',
})

export class ElegirPacienteComponent {
    public snapshot;
    public selectedCama;

    constructor(
        private plex: Plex,
        private ingresoPacienteService: IngresoPacienteService,
        private pacienteService: PacienteService,
        private InternacionResumenHTTP: InternacionResumenHTTP,
        private auth: Auth
    ) { }

    onPacienteSelected(paciente: IPaciente) {
        // Si se seleccionó por error un paciente fallecido
        this.pacienteService.checkFallecido(paciente);
        // verificamos internaciones en curso
        this.InternacionResumenHTTP.search({
            organizacion: this.auth.organizacion.id,
            paciente: paciente.id
        }).subscribe(internaciones => {
            const enCurso = internaciones.filter(i => !i.fechaEgreso);
            if (enCurso.length) {
                this.plex.info('warning', `${paciente.apellido}, ${paciente.alias || paciente.nombre}, DNI: ${paciente.documento || paciente.numeroIdentificacion} tiene una internacion
                en curso con fecha de ingreso el <b>${moment(internaciones[0].fechaIngreso).format('DD/MM/YYYY hh:mm')}</b>.`, 'Paciente ya internado');
            } else {
                this.ingresoPacienteService.selectPaciente(paciente.id);
            }
        });
    }

    searchEnd(resultado: any) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        }
    }
}
