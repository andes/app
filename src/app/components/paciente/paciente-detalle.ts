import { Component, Input } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import {
    PacienteService
} from './../../services/paciente.service';
import {
    RenaperService
} from './../../services/fuentesAutenticas/servicioRenaper.service';

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

    constructor(private pacienteService: PacienteService, private renaperService: RenaperService) { }

    renaperVerification(patient) {
        // TODO llamar al servicio de renaper y actualizar: Fatos básicos y Foto
        // En caso que el paciente ya esté validado sólo traer la foto!

        this.renaperService.get(patient.documento).subscribe(resultado => {
            // hacer cositas
        })
    }
}
