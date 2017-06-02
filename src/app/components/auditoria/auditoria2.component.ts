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
    pacientesSimilares: any[];
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
            this.pacientesAudit = resultado;
        });
    }

    verificaPaciente(paciente) {
        if (paciente.nombre && paciente.apellido && paciente.documento && paciente.fechaNacimiento && paciente.sexo) {

            let dto: any = {
                type: 'suggest',
                claveBlocking: 'documento',
                percentage: true,
                apellido: paciente.apellido.toString(),
                nombre: paciente.nombre.toString(),
                documento: paciente.documento.toString(),
                sexo: ((typeof paciente.sexo === 'string')) ? paciente.sexo : (Object(paciente.sexo).id),
                fechaNacimiento: paciente.fechaNacimiento
            };

            this.pacienteService.get(dto).subscribe(resultado => {
                this.pacientesSimilares = resultado;
                console.log(this.pacientesSimilares);
                // res.forEach(pac => {
                //     if (pac.match >= 0.7) {
                //         this.posiblesDuplicados.push(pac);
                //     }
                // });

            });
        }
    }
}
