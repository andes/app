import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment';
// Interfaces
import { IAudit } from '../../interfaces/auditoria/IAudit';
// Services
import { PacienteService } from './../../services/paciente.service';
import { AuditoriaService } from '../../services/auditoria/auditoria.service';
@Component({
    selector: 'auditoria1',
    templateUrl: 'auditoria1.html',
    styleUrls: ['auditoria1.css']
})

export class Auditoria1Component implements OnInit {

    showValidator = false;
    seleccionada = false;
    loading = false;
    result = false;
    pacienteSelected: any;
    btnSisa = false;
    btnSintys = false;
    btnRenaper = false;
    expand = false;
    resultado: any[];

    pacientesTemporales: any[];

    constructor(
        private formBuilder: FormBuilder,
        private auditoriaService: AuditoriaService,
        private pacienteService: PacienteService,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.getTemporales();

    }

    getTemporales() {
        this.loading = true;
        this.pacienteService.getTemporales().subscribe(data => {
            debugger
            this.loading = false;
            this.pacientesTemporales = data;
        });
    }

    showLoader() {
        this.result = false;
        this.loading = true;
        setTimeout(() => this.showResult(), 2000);
    }

    validarSisa(band: any, paciente: any) {
        this.showLoader();
        // this.resultado = this.datosSisa;
        this.plex.info('warning', '', 'Match Incompleto');
        paciente.entidadesValidadoras.push('Sisa');
        this.seleccionarPaciente(paciente);
    }

    validarSintys(band: any, paciente: any) {
        this.showLoader();
        this.resultado = [];
        this.plex.info('danger', '', 'No Encontrado');
        paciente.entidadesValidadoras.push('Sintys');
        this.seleccionarPaciente(paciente);
    }

    validarRenaper(band: any, paciente: any) {
        this.showLoader();
        this.plex.info('success', '', 'Paciente Validado');
        this.resultado = [
            {
                'documento': paciente.documento,
                'nombre': paciente.nombre,
                'apellido': paciente.apellido,
                'sexo': paciente.sexo,
                'fechaNacimiento': paciente.fechaNacimiento,
                'similitud': '1'
            }
        ]
        paciente.entidadesValidadoras.push('Renaper');
        this.seleccionarPaciente(paciente);
    }


    showResult() {
        this.loading = false;
        this.result = true;

    }

    estaSeleccionado(paciente: any) {
        debugger;
        return this.pacienteSelected === paciente;
    }

    seleccionarPaciente(paciente: any) {
        // this.btnRenaper = false;
        // this.btnSintys = false;
        // this.btnSisa = false;
        this.pacienteSelected = paciente;
        // (this.pacienteSelected.entidadesValidadoras.indexOf('Sisa') >= 0) ? this.btnSisa = true : this.btnSisa = false;
        // (this.pacienteSelected.entidadesValidadoras.indexOf('Renaper') >= 0) ? this.btnRenaper = true : this.btnRenaper = false;
        // (this.pacienteSelected.entidadesValidadoras.indexOf('Sintys') >= 0) ? this.btnSintys = true : this.btnSintys = false;
    }
}
