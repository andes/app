import { Component, Input } from '@angular/core';
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
    @Input() paciente: IPaciente;
    renaperFoto;
    // datos

    constructor(private pacienteService: PacienteService, private renaperService: RenaperService) { }

    renaperVerification(patient) {
        // TODO llamar al servicio de renaper y actualizar: Datos básicos y Foto
        // En caso que el paciente ya esté validado sólo traer la foto!
        let sexoRena = (patient.sexo === 'masculino') ? 'M' : 'F';
        this.renaperService.get({ documento: patient.documento, sexo: sexoRena }).subscribe(resultado => {
            if (resultado) {
                let codigo = resultado.codigo;
                let datos = resultado.datos;
                this.paciente.foto = resultado.datos.foto;
            } else {
                // TODO ver el tema de mostrar algún error si no trae nada
                console.log('entro por algun problema');
            }

        });
    }
}
