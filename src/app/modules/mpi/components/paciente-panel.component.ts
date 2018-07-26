import { Component, Input } from '@angular/core';
import { IPaciente } from '../../../interfaces/IPaciente';
import { Observable } from 'rxjs/Observable';
import { ObraSocialService } from '../../../services/obraSocial.service';
import { ProfeService } from '../../../services/profe.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'paciente-panel',
    templateUrl: 'paciente-panel.html',
    styleUrls: ['paciente-panel.scss']
})
export class PacientePanelComponent {
    private _paciente: IPaciente;
    private request: Subscription;

    // Propiedades públicas
    public coberturaSocial: string;
    public coberturaSocialLoading: boolean;
    public coberturaSocialError: boolean;

    @Input()
    get paciente(): IPaciente {
        return this._paciente;
    }
    set paciente(value: IPaciente) {
        this._paciente = value;
        // this.actualizarCoberturaSocial();
    }

    constructor(private obraSocialService: ObraSocialService, private profeService: ProfeService) { }

    // @jfgabriel | Deshabilitado momentáneamente hasta que se integren los nuevos servicios Obras Sociales
    // actualizarCoberturaSocial() {
    //     if (this.request) {
    //         this.request.unsubscribe();
    //     }
    //     this.coberturaSocial = null;
    //     this.coberturaSocialLoading = true;
    //     this.coberturaSocialError = false;

    //     // Llama a la API
    //     if (this.paciente && this.paciente.documento) {
    //         this.request = Observable.forkJoin([
    //             this.obraSocialService.get({ dni: this.paciente.documento }, false),
    //             this.profeService.get({ dni: this.paciente.documento }, false)]).subscribe(t => {
    //                 this.coberturaSocialLoading = false;
    //                 this.coberturaSocial = 'FAKE FAKE FAKE';
    //             }, (err) => {
    //                 this.coberturaSocialError = true;
    //                 this.coberturaSocialLoading = false;
    //             });
    //     }
    // }
}
