import { Component, Input, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { PrestacionesService } from '../../../services/prestaciones.service';

@Component({
    selector: 'rup-resumenPaciente-dinamico',
    templateUrl: 'resumenPaciente-dinamico.html'
})

export class ResumenPacienteDinamicoComponent implements OnInit {
    @Input() paciente: IPaciente;

    public registros: any[] = [];
    public graficos: any[] = [];
    public elementos: any[] = [];
    public conceptosGrafico: ISnomedConcept[] = [
        {
            conceptId: '307818003',
            fsn: 'seguimiento del peso (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            term: 'seguimiento del peso'
        },
        {
            conceptId: '710996002',
            fsn: 'seguimiento de la talla (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            term: 'seguimiento de la talla'
        },
        {
            fsn: 'control de la tensión arterial (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            conceptId: '135840009',
            term: 'monitoreo de la tensión arterial'
        },
        {

            conceptId: '70443007',
            fsn: 'medición de depuración renal (procedimiento)',
            semanticTag: 'procedimiento',
            term: 'medición de depuración renal'
        },
        {
            conceptId: '211000246108',
            fsn: 'curva de temperatura corporal (elemento de registro)',
            semanticTag: 'elemento de registro',
            term: 'curva de temperatura corporal'
        }
    ];

    conceptos: ISnomedConcept[] = [
        {
            conceptId: '441829007',
            term: 'evaluación del riesgo de enfermedad cardiovascular',
            fsn: 'evaluación del riesgo de enfermedad cardiovascular (procedimiento)',
            semanticTag: 'procedimiento'
        }
    ];

    constructor(
        public elementosRUPService: ElementosRUPService,
        public auth: Auth,
        public prestacionesService: PrestacionesService,
    ) { }

    ngOnInit() {
        for (const conceptoGrafico of this.conceptosGrafico) {
            this.graficos.push(this.elementosRUPService.buscarElemento(conceptoGrafico, false));
        }
        // Loopeamos los conceptos que no son graficos y recupermaos su ultimo registro
        for (const concepto of this.conceptos) {
            this.elementos = [...this.elementos, this.elementosRUPService.buscarElemento(concepto, false)];
            this.prestacionesService.getRegistrosHuds(this.paciente.id, '<<' + concepto.conceptId).subscribe(prestaciones => {
                if (prestaciones.length) {
                    this.registros = [...this.registros, prestaciones[prestaciones.length - 1]];
                }
            });

        }
    }
}
