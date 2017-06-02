import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { AuditoriaService } from '../../services/auditoria/auditoria.service';
import {
    IAudit
} from '../../interfaces/auditoria/IAudit';
import {
    PacienteService
} from './../../services/paciente.service';
import * as moment from 'moment';
import { LogService } from '../../services/log.service';

// import {
//   AuditoriaPage
// } from './../../e2e/app.po';

@Component({
    selector: 'auditoria2',
    templateUrl: 'auditoria2.html',
})


export class Auditoria2Component implements OnInit {

    seleccionada = false;
    verDuplicados = false;
    posiblesDuplicados: any[];
    pacientesAudit: any[];


    constructor(
        private formBuilder: FormBuilder,
        private auditoriaService: AuditoriaService,
        private pacienteService: PacienteService,
        private plex: Plex,
        private logService: LogService
    ) { }

    ngOnInit() {
        let dto = {
            'op': 'posibleDuplicado'
        }
        this.logService.get('mpi', dto).subscribe(resultado => {
            debugger
            this.pacientesAudit = resultado;
        });
    }
}