import { Plex } from '@andes/plex';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IPacienteRelacion } from '../../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { PacienteHttpService } from '../services/pacienteHttp.service';

@Component({
    selector: 'mpi-paciente-panel',
    templateUrl: 'paciente-panel.html',
    styleUrls: ['paciente-panel.scss']
})
export class PacientePanelComponent {
    private _paciente: IPaciente;

    // Propiedades públicas
    public coberturaSocial: {
        data: string;
        loading: boolean;
        error: boolean;
    };

    public relaciones: {
        data: IPacienteRelacion[];
        loading: boolean;
        error: boolean;
    };

    /**
     * Indica si permite seleccionar un paciente relacionado
     *
     * @memberof PacientePanelComponent
     */
    @Input() permitirseleccionarRelacion = true;

    /**
    * Paciente para mostrar
    *
    * @memberof PacientePanelComponent
    */
    @Input()
    get paciente(): IPaciente {
        return this._paciente;
    }
    set paciente(value: IPaciente) {
        this._paciente = value;
        if (this._paciente && this._paciente.id) {
            this.pacienteHttpService.findById(this._paciente.id, {}).subscribe((data) => this.relaciones.data = data.relaciones || []);
        }
    }
    /**
     * Evento que se emite cuando se selecciona un paciente
     *
     * @type {EventEmitter<IPaciente>}
     * @memberof PacientePanelComponent
     */
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    constructor(private plex: Plex, private pacienteHttpService: PacienteHttpService) {
        this.coberturaSocial = { data: null, loading: false, error: false };
        this.relaciones = { data: null, loading: false, error: false };
    }

    seleccionarRelacionado(relacionado: IPacienteRelacion) {
        if (relacionado.referencia) {
            this.plex.toast('info', 'Recuperando información del paciente', 'Información', 2000);
            this.pacienteHttpService.findById(relacionado.referencia, {}).subscribe((data) => this.selected.emit(data));
        } else {
            this.plex.info('warning', 'Este paciente no está registrado en MPI (índice de pacientes) y no puede seleccionarse');
        }
    }
}
