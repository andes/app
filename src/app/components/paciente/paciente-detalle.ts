import { Component, Input, EventEmitter, Output } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
// import { PacienteService } from './../../services/paciente.service';
// import { RenaperService } from './../../services/fuentesAutenticas/servicioRenaper.service';
// import { SisaService } from './../../services/fuentesAutenticas/servicioSisa.service';
// import { Plex } from '@andes/plex';
// import { PacienteCreateUpdateComponent } from './paciente-create-update.component';
import { ObraSocialService } from '../../services/obraSocial.service';
import { IObraSocial } from '../../interfaces/IObraSocial';
import { Auth } from '@andes/auth';

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

    @Input() orientacion: 'vertical' | 'horizontal' = 'vertical';
    @Input('paciente')
    set paciente(value: IPaciente) {
        this._paciente = value;
    }
    get paciente() {
        return this._paciente;
    }

    @Output() renaperNotification: EventEmitter<boolean> = new EventEmitter<boolean>();

    _paciente: IPaciente;
    loading = false;
    inconsistenciaDatos = false;
    obraSocial: IObraSocial;    // Si existen mas de dos se muestra solo la de la primera posicion del array
    nombrePattern;


    constructor(
        // private renaperService: RenaperService,
        // private plex: Plex,
        // public auth: Auth,
        // private pacienteService: PacienteService,
        private obraSocialService: ObraSocialService) {

    }

}
