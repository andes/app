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
import { IPaciente } from '../../interfaces/IPaciente';
// Services
import { PacienteService } from './../../services/paciente.service';
import { AuditoriaService } from '../../services/auditoria/auditoria.service';
import { SisaService } from '../../services/fuentesAutenticas/servicioSisa.service';
// Pipes
import { TextFilterPipe } from './../../pipes/textFilter.pipe';
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
    pacienteSelected: IPaciente;
    disableValidar = false;
    resultado: any[];
    pacientesTemporales: any[];
    filtro = '';

    private datosSisa: any;

    constructor(
        private formBuilder: FormBuilder,
        private auditoriaService: AuditoriaService,
        private pacienteService: PacienteService,
        private servicioSisa: SisaService,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.getTemporales();

    }

    getTemporales() {
        // TODO: filtrar los pacientes DESACTIVADOS y no mostrarlos en el listado
        this.loading = true;
        this.pacienteService.getTemporales().subscribe(data => {
            this.loading = false;
            this.pacientesTemporales = data;
        });
    }

    validar() {
        this.loading = true;
        this.servicioSisa.ValidarPacienteEnSisa(this.pacienteSelected).then(res => {
            this.loading = false;
            this.pacienteSelected = this.pacienteSelected;
            this.datosSisa = res;
            if (this.datosSisa.matcheos && this.datosSisa.matcheos.matcheo === 100) {
                this.validarPaciente();
            }
            if (this.datosSisa.matcheos && this.datosSisa.matcheos.matcheo > 94 && this.pacienteSelected.sexo === this.datosSisa.matcheos.datosPaciente.sexo && this.pacienteSelected.documento === this.datosSisa.matcheos.datosPaciente.documento) {
                this.disableValidar = true;
                this.editarPaciente();
            }
        });
    }


    editarPaciente() {
        this.pacienteSelected.nombre = this.datosSisa.matcheos.datosPaciente.nombre;
        this.pacienteSelected.apellido = this.datosSisa.matcheos.datosPaciente.apellido;
        this.pacienteSelected.fechaNacimiento = this.datosSisa.matcheos.datosPaciente.fechaNacimiento;
        this.pacienteSelected.estado = 'validado';
        this.pacienteSelected.entidadesValidadoras.push('Sisa');
        this.pacienteService.save(this.pacienteSelected).subscribe(result => {
            this.plex.info('success', '', 'Validación Exitosa');
            this.getTemporales();
        });
    }

    validarPaciente() {
        this.pacienteSelected.nombre = this.datosSisa.datosPaciente.nombre;
        this.pacienteSelected.apellido = this.datosSisa.datosPaciente.apellido;
        this.pacienteSelected.estado = 'validado';
        this.pacienteSelected.entidadesValidadoras.push('Sisa');
        this.pacienteService.save(this.pacienteSelected).subscribe(result => {
            this.plex.info('success', '', 'Validación Exitosa');
            this.getTemporales();
        });
    }

    estaSeleccionado(paciente: any) {
        return this.pacienteSelected === paciente;
    }

    seleccionarPaciente(paciente: any) {
        this.pacienteSelected = paciente;
    }
}
