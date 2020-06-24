import { Plex } from '@andes/plex';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { ObraSocialService } from '../../../services/obraSocial.service';
import { ProfeService } from '../../../services/profe.service';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { ɵangular_packages_core_testing_testing_a } from '@angular/core/testing';
import { RelacionesPacientesComponent } from '../../../core/mpi/components/relaciones-pacientes.component';

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
    /**
     * Evento que se emite cuando se selecciona un paciente
     *
     * @type {EventEmitter<IPaciente>}
     * @memberof PacientePanelComponent
     */
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    @Output() changeRelacion: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex,
        private obraSocialService: ObraSocialService,
        private profeService: ProfeService) {
        this.coberturaSocial = { data: null, loading: false, error: false };
    }

    get justificado() {
        return this.direction === 'column' ? 'center' : 'start';
    }

    get relaciones() {
        this.idPacientesRelacionados = [];
        if (this.paciente.relaciones) {
            this.paciente.relaciones.map(rel => this.idPacientesRelacionados.push({ id: rel.referencia }));
        }
        return this.paciente.relaciones;
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
