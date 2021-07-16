import { Plex } from '@andes/plex';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';

@Component({
    selector: 'inscripcion-busqueda-paciente',
    templateUrl: './busqueda-paciente.html'
})
export class InscripcionBusquedaPacienteComponent {

    @Output() returnBusqueda: EventEmitter<any> = new EventEmitter<any>();
    resultadoBusqueda = null;
    pacienteSelected = null;
    loading = false;

    constructor(
        public plex: Plex,
        private pacienteService: PacienteService
    ) { }

    searchStart() {
        this.loading = true;
    }

    searchEnd(resultado) {
        this.loading = false;
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.resultadoBusqueda = resultado.pacientes;
    }

    onSearchClear() {
        this.resultadoBusqueda = null;
    }

    seleccionarPaciente(paciente) {
        // Si se seleccionó por error un paciente fallecido
        this.pacienteService.checkFallecido(paciente);
        // En caso de que sea extranjero verifica que tenga número de identificacion
        if (paciente.documento === '' && (!paciente.numeroIdentificacion || paciente.numeroIdentificacion === '')) {
            this.plex.info('warning', 'El paciente no posee número de identificación');
        } else {
            this.returnBusqueda.emit({ status: true, paciente: paciente.id });
        }
    }

    cerrar() {
        this.returnBusqueda.emit({ status: false });
    }

}
