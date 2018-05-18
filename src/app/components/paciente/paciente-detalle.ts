import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import {
    PacienteService
} from './../../services/paciente.service';
import {
    RenaperService
} from './../../services/fuentesAutenticas/servicioRenaper.service';
import { MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/material';


@Component({
    selector: 'paciente-detalle',
    templateUrl: 'paciente-detalle.html',
    styleUrls: ['paciente-detalle.scss']
})
export class PacienteDetalleComponent {
    /**
     * Recibe un paciente por parámetro
     *
     * @type {IPaciente}
     * @memberof PacienteDetalleComponent
     */
    @Input('paciente')
    set paciente(value: IPaciente) {
        this._paciente = value;
    }
    get paciente() {
        return this._paciente;
    }

    @Output() renaperNotification: EventEmitter<boolean> = new EventEmitter<boolean>();

    private _paciente: IPaciente;
    loading = false;
    deshabilitar = false;
    inconsistenciaDatos = false;

    constructor(private pacienteService: PacienteService, private renaperService: RenaperService) { }

    renaperVerification(patient) {

        // TODO llamar al servicio de renaper y actualizar: Datos básicos y Foto
        // En caso que el paciente ya esté validado sólo traer la foto!
        // Cancela la búsqueda anterior

        window.document.getElementById('detalleContenedor').style.opacity = '0.3';
        this.loading = true;
        let sexoRena = null;
        let documentoRena = null;
        if (patient.estado === 'validado') {
            sexoRena = patient.sexo === 'masculino' ? 'M' : 'F';
            documentoRena = patient.documento;
        } else {
            sexoRena = (patient.sexo.id === 'masculino') ? 'M' : 'F';
            documentoRena = patient.documento;
        }

        this.renaperService.get({ documento: documentoRena, sexo: sexoRena }).subscribe(resultado => {

            this.loading = false;
            this.deshabilitar = true;
            if (resultado) {
                let codigo = resultado.codigo;
                let datos = resultado.datos;
                if (patient.estado === 'temporal') {
                    patient.nombre = resultado.datos.nombres;
                    patient.apellido = resultado.datos.apellido;
                    patient.fechaNacimiento = resultado.datos.fechaNacimiento;
                    patient.estado = 'validado';
                    this.paciente.direccion[0].valor = datos.calle + ' ' + datos.numero;
                    this.paciente.direccion[0].codigoPostal = datos.cpostal;
                };
                patient.foto = resultado.datos.foto;
                this.renaperNotification.emit(true);
            } else {
                // TODO ver el tema de mostrar algún error si no trae nada
                console.log('entro por algun problema');
            }

            window.document.getElementById('detalleContenedor').style.opacity = '1';
        });
    }
}
