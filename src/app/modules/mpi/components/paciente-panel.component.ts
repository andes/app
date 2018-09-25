import { Plex } from '@andes/plex';
import { IPacienteRelacion } from './../interfaces/IPacienteRelacion.inteface';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../../../interfaces/IPaciente';
import { Observable } from 'rxjs/Observable';
import { ObraSocialService } from '../../../services/obraSocial.service';
import { ProfeService } from '../../../services/profe.service';
import { Subscription } from 'rxjs/Subscription';
import { PacienteService } from '../../../services/paciente.service';

@Component({
    selector: 'paciente-panel',
    templateUrl: 'paciente-panel.html',
    styleUrls: ['paciente-panel.scss']
})
export class PacientePanelComponent {
    private _paciente: IPaciente;
    private request: Subscription;

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
        if (this._paciente) {
            // Obtiene relaciones
            this.pacienteService.getById(this._paciente.id).subscribe((data) => this.relaciones.data = data.relaciones || []);
            // Obtiene cobertura social más reciente
            this.actualizarCoberturaSocial();
        }
    }
    /**
     * Evento que se emite cuando se selecciona un paciente
     *
     * @type {EventEmitter<IPaciente>}
     * @memberof PacientePanelComponent
     */
    @Output() selected: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    constructor(private plex: Plex, private pacienteService: PacienteService, private obraSocialService: ObraSocialService, private profeService: ProfeService) {
        this.coberturaSocial = { data: null, loading: false, error: false };
        this.relaciones = { data: null, loading: false, error: false };
    }

    actualizarCoberturaSocial() {
        // @jfgabriel | Deshabilitado momentáneamente hasta que se integren los nuevos servicios Obras Sociales
        // if (this.request) {
        //     this.request.unsubscribe();
        // }
        // this.coberturaSocial.data = null;
        // this.coberturaSocial.loading = true;
        // this.coberturaSocial.error = false;

        // // Llama a la API
        // if (this.paciente && this.paciente.documento) {
        //     this.request = Observable.forkJoin([
        //         this.obraSocialService.get({ dni: this.paciente.documento }, false),
        //         this.profeService.get({ dni: this.paciente.documento }, false)]).subscribe(t => {
        //             this.coberturaSocial.loading = false;
        //             this.coberturaSocial.data = '*** SIN IMPLEMENTAR ***';
        //         }, (err) => {
        //             this.coberturaSocial.error = true;
        //             this.coberturaSocial.loading = false;
        //         });
        // }
    }

    seleccionarRelacionado(relacionado: IPacienteRelacion) {
        if (relacionado.referencia) {
            this.plex.toast('info', 'Recuperando información del paciente', 'Información', 2000);
            this.pacienteService.getById(relacionado.referencia).subscribe((data) => this.selected.emit(data));
        } else {
            this.plex.info('warning', 'Este paciente no está registrado en MPI (índice de pacientes) y no puede seleccionarse');
        }
    }
}
