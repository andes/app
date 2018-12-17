import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../../interfaces/IPaciente';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { IPrestacion } from '../../../interfaces/prestacion.interface';

@Component({
    selector: 'rup-resumenPaciente-dinamico',
    templateUrl: 'resumenPaciente-dinamico.html'
})

export class ResumenPacienteDinamicoComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacion;

    public graficos: any[] = [];
    public conceptos: ISnomedConcept[] = [
        {
            conceptId: '307818003',
            fsn: 'seguimiento del peso (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            term: 'seguimiento del peso'
        },
        {
            conceptId: '710996002',
            fsn: 'monitorización de la talla (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            term: 'monitorización de la talla'
        },
        {
            fsn: 'control de la tensión sanguínea (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            conceptId: '135840009',
            term: 'monitoreo de la tensión sanguínea'
        }
    ];

    constructor(
        public elementosRUPService: ElementosRUPService,
        public auth: Auth
    ) { }

    ngOnInit() {
        for (let concepto of this.conceptos) {
            this.graficos.push(this.elementosRUPService.buscarElemento(concepto, false));
        }
    }
}
