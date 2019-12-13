import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-ingresar-paciente',
    templateUrl: './ingresar-paciente.component.html',
})

export class IngresarPacienteComponent implements OnInit {
    @Input() fecha: Date;
    @Input() cama: any;

    @Output() cancelIngreso = new EventEmitter<any>();

    pacientes = [];
    pacienteSelected: any;
    constructor(
        private plex: Plex,
        public auth: Auth,
        private router: Router,
    ) { }

    ngOnInit() {

    }

    cancelar() {
        this.cancelIngreso.emit();
    }

    onPacienteSelected(event) {
        this.pacienteSelected = event;
        console.log(event);
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
