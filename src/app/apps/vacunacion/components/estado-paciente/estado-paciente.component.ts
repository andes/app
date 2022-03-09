import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'app-estado-paciente',
    templateUrl: './estado-paciente.component.html'
})
export class EstadoPacienteComponent implements OnInit {
    public paciente: IPaciente = null;
    public showLabel = true;
    public pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'direccion', 'telefono'];

    constructor(
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (!this.auth.check('vacunacion:verificar-estado')) {
            this.router.navigate(['./inicio']);
        }
    }

    onSearchStart() {
        this.showLabel = false;
    }

    onSearchClear() {
        this.showLabel = true;
    }

    searchVacunas(event) {
        this.paciente = event;
    }

    close() {
        this.paciente = null;
    }
}
