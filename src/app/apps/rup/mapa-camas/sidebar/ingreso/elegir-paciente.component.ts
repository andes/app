import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-elegir-paciente',
    templateUrl: './elegir-paciente.component.html',
})

export class ElegirPacienteComponent implements OnInit {
    public pacientes;

    constructor(
        private plex: Plex,
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() { }

    onPacienteSelected(event) {
        this.mapaCamasService.selectedPaciente.next(event);
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
