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
    loading = false;
    deshabilitar = false;
    inconsistenciaDatos = false;
    pacientesSimilares = [];

    constructor(private pacienteService: PacienteService, private renaperService: RenaperService) { }

    renaperVerification(patient) {
        // TODO llamar al servicio de renaper y actualizar: Datos básicos y Foto
        // En caso que el paciente ya esté validado sólo traer la foto!
        // Cancela la búsqueda anterior

        this.deshabilitar = true;
        window.document.getElementById("detalleContenedor").style.opacity = '0.3';
        this.loading = true;
        let sexoRena = (patient.sexo === 'masculino') ? 'M' : 'F';


        this.renaperService.get({ documento: patient.documento, sexo: sexoRena }).subscribe(resultado => {
            this.loading = false;
            if (resultado) {
                let codigo = resultado.codigo;
                let datos = resultado.datos;
                console.log(datos);

                // si esta validado agregamos foto y chequeamos domicilio.
                if (patient.estado === 'validado') {
                    patient.foto = resultado.datos.foto;
                    // (patient.direccion['valor'] == "") ? patient.direccion['valor'] = datos.calle + datos.numero : '';
                } else {
                    this.paciente.nombre = resultado.datos.nombres;
                    this.paciente.apellido = resultado.datos.apellido;
                    this.paciente.fechaNacimiento = moment(resultado.datos.fechaNacimiento, 'DD/MM/YYYY');
                    this.paciente.direccion[0]['valor'] = datos.calle + ' ' + datos.numero;
                    this.paciente.direccion[0]['codigoPostal'] = datos.cpostal;
                }

            } else {
                // TODO ver el tema de mostrar algún error si no trae nada
                console.log('entro por algun problema');
            }

            window.document.getElementById("detalleContenedor").style.opacity = '1';
            console.log('paciente: ', this.paciente);
        });
    }
}
