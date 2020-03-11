import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-elegir-paciente',
    templateUrl: './elegir-paciente.component.html',
})

export class ElegirPacienteComponent implements OnInit {
    public pacientes;
    public snapshot;

    constructor(
        private plex: Plex,
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
    }

    onPacienteSelected(paciente: IPaciente) {
        this.mapaCamasService.selectPaciente(paciente);
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: any) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }
}
