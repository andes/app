import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'paciente-panel',
    templateUrl: 'paciente-panel.html',
    styleUrls: ['paciente-panel.scss']
})
export class PacientePanelComponent {

    // Propiedades públicas
    public coberturaSocial: {
        data: string;
        loading: boolean;
        error: boolean;
    };
    public idPacientesRelacionados = [];
    _paciente: IPaciente;

    @Input() showRelaciones = false;

    /**
     * Setea atributo 'direction' de plex-detail
     */
    @Input() direction: 'column' | 'row' = 'row';

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
    @Input() paciente: IPaciente;

    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    @Output() changeRelacion: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
        this.coberturaSocial = { data: null, loading: false, error: false };
    }

    get justificado() {
        return this.direction === 'column' ? 'center' : 'start';
    }

    get estadoBadgeType() {
        return this.paciente.estado === 'validado' ? 'success' : 'warning';
    }

    public editRelacion(relacion: any) {
        this.changeRelacion.emit({ operacion: 'edit', idRelacionado: relacion.referencia });
    }

    public removeRelacion(relacion: any) {
        this.changeRelacion.emit({ operacion: 'remove', idRelacionado: relacion.referencia });
    }
}
