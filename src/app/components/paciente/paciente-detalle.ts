import { Component, Input } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';

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

    /**
     * Tamaño de resultados, para que sea más flexible cuando hay poco espacio de pantalla
     * Opciones (se puede extender): 'normal' (default) | 'small'
     */
    @Input() size: String = 'normal';
}
