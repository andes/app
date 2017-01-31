import { PacienteService } from './../../services/paciente.service';
import { IPaciente } from './../../interfaces/IPaciente';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'tensionDiastolica',
    templateUrl: 'tensionDiastolica.html'
})
export class TensionDiastolicaComponent implements OnInit {

    @Input('paciente') paciente: IPaciente;

    tensionDiastolica: Number = null;

    ngOnInit() {
        // if (this.paciente.edad < 3) {
        //     this.tensionDiastolica = {
        //         min: 20,
        //         max: 200,
        //         valor: 20
        //     }
        // }
    }



}