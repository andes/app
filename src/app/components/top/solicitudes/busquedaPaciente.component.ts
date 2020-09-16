import { Plex } from '@andes/plex';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';


@Component({
    selector: 'busqueda-paciente',
    templateUrl: './busquedaPaciente.html'
})
export class BusquedaPacienteComponent implements OnInit {

    @Output() returnBusqueda: EventEmitter<any> = new EventEmitter<any>();
    resultadoBusqueda = null;
    pacienteSelected = null;
    loading = false;

    constructor(
        public plex: Plex
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
        this.returnBusqueda.emit({ status: true, paciente: paciente.id });
    }

    cerrar() {
        this.returnBusqueda.emit({ status: false });
    }

}
