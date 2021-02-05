import { Plex } from '@andes/plex';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';


@Component({
    selector: 'top-busqueda-paciente',
    templateUrl: './busquedaPaciente.html'
})
export class BusquedaPacienteComponent implements OnInit {

    @Output() returnBusqueda: EventEmitter<any> = new EventEmitter<any>();
    resultadoBusqueda = null;
    pacienteSelected = null;
    loading = false;

    constructor(
        public plex: Plex,
        private pacienteService: PacienteService
    ) { }

    ngOnInit() {
    }

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
        this.returnBusqueda.emit({ status: true, paciente: paciente.id });
    }

    cerrar() {
        this.returnBusqueda.emit({ status: false });
    }

}
