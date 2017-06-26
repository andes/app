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
import { AgendaService } from './../../services/turnos/agenda.service';
import { AuditoriaService } from '../../services/auditoria/auditoria.service';
import { SisaService } from '../../services/fuentesAutenticas/servicioSisa.service';
import { SintysService } from '../../services/fuentesAutenticas/servicioSintys.service';
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
    result = false;
    pacienteSelected: IPaciente;
    enableValidar = true;
    enableBaja = false;
    resultado: any[];
    pacientesTemporales: any[];
    filtro = '';
    mostrarDetalle = false;

    private datosFA: any;

    constructor(
        private formBuilder: FormBuilder,
        private auditoriaService: AuditoriaService,
        private pacienteService: PacienteService,
        private servicioSisa: SisaService,
        private servicioSintys: SintysService,
        private agendaService: AgendaService,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.getTemporales();

    }

    getTemporales() {
        // TODO: filtrar los pacientes DESACTIVADOS y no mostrarlos en el listado
        this.plex.showLoader();
        this.pacienteService.getTemporales().subscribe(data => {
            this.plex.hideLoader();
            this.pacientesTemporales = data;
        });
    }

    validar() {
        this.plex.showLoader();
        this.servicioSisa.ValidarPacienteEnSisa(this.pacienteSelected).then(res => {
            if (!this.verificarDatosFA(res)) {
                this.servicioSintys.ValidarPacienteEnSintys(this.pacienteSelected).then(res2 => {
                    if (!this.verificarDatosFA(res2)) {

                        if (this.datosFA.matcheos && this.datosFA.matcheos.matcheo < 90) {
                            // TODO: chequear si el paciente tiene algun turno o prestacion asignado/a
                            this.agendaService.find(this.pacienteSelected.id).subscribe(data => {
                                if (data.length < 1) {
                                    this.plex.confirm('¿Desea darlo de baja?', 'Paciente inactivo').then((confirmar) => {
                                        if (confirmar) {
                                            this.pacienteSelected.activo = false;
                                            this.pacienteService.save(this.pacienteSelected).subscribe(res3 => {
                                                this.getTemporales();
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            this.rechazarValidacion();
                        }

                    }
                });

            }
        });
    }

    rechazarValidacion() {
        if (this.pacienteSelected.entidadesValidadoras.find(entidad => entidad.toString().toUpperCase() === 'SISA')) {
            this.pacienteSelected.entidadesValidadoras.push('SISA');
            this.pacienteService.save(this.pacienteSelected).subscribe(result => {
                this.plex.info('danger', '', 'Paciente no encontrado');
                this.getTemporales();
            });
        } else {
            this.getTemporales();
        }
    }

    verificarDatosFA(data) {
        this.plex.hideLoader();
        this.pacienteSelected = this.pacienteSelected;
        this.datosFA = data;
        if (this.datosFA.matcheos && this.datosFA.matcheos.matcheo === 100) {
            this.validarPaciente();
            this.mostrarDetalle = false;
            return true;
        }
        if (this.datosFA.matcheos && this.datosFA.matcheos.matcheo >= 94 && this.pacienteSelected.sexo === this.datosFA.matcheos.datosPaciente.sexo && this.pacienteSelected.documento === this.datosFA.matcheos.datosPaciente.documento) {
            this.enableValidar = false;
            this.editarPaciente();
            this.mostrarDetalle = false;
            return true;
        } else {
            return false;
        }

    }

    editarPaciente() {
        this.pacienteSelected.nombre = this.datosFA.matcheos.datosPaciente.nombre;
        this.pacienteSelected.apellido = this.datosFA.matcheos.datosPaciente.apellido;
        this.pacienteSelected.fechaNacimiento = this.datosFA.matcheos.datosPaciente.fechaNacimiento;
        this.pacienteSelected.estado = 'validado';
        this.pacienteSelected.entidadesValidadoras.push('Sisa');
        this.pacienteService.save(this.pacienteSelected).subscribe(result => {
            this.plex.info('success', '', 'Validación Exitosa');
            this.getTemporales();
        });
    }

    validarPaciente() {
        this.pacienteSelected.nombre = this.datosFA.matcheos.datosPaciente.nombre;
        this.pacienteSelected.apellido = this.datosFA.matcheos.datosPaciente.apellido;
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
