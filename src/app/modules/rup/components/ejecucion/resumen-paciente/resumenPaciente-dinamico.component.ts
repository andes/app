import { Component, Input, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';
import { ISeguimientoPaciente } from '../../../interfaces/seguimientoPaciente.interface';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { SeguimientoPacientesService } from '../../../services/seguimientoPacientes.service';
import { subscribeOn } from 'rxjs/operators';

@Component({
    selector: 'rup-resumenPaciente-dinamico',
    templateUrl: 'resumenPaciente-dinamico.html'
})

export class ResumenPacienteDinamicoComponent implements OnInit {
    @Input() paciente: IPaciente;

    public registros: any[] = [];
    public graficos: any[] = [];
    public elementos: any[] = [];

    public registrosSeguimiento: ISeguimientoPaciente[] = [];
    public elementoSeguimiento: any[] = [];

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

    // Seguimiento paciente San Juan

    conceptoSeguimientoPaciente: ISnomedConcept[] = [{
            conceptId: '408403008',
            term: 'registro llevado por el paciente',
            fsn: 'registro llevado por el paciente (elemento de registro)',
            semanticTag: 'elemento de registro'
        },
        {
            conceptId: '413153004',
            term: 'tensión arterial registrada por el paciente en su hogar',
            fsn: 'tensión arterial registrada por el paciente en su hogar (procedimiento)',
            semanticTag: 'procedimiento'
        },
        {
            conceptId: '103228002',
            term: 'saturación de oxígeno en sangre',
            fsn: 'saturación de hemoglobina con oxígeno (entidad observable)',
            semanticTag: 'entidad observable'
        }
    ] ;



    constructor(
        public elementosRUPService: ElementosRUPService,
        public auth: Auth,
        public prestacionesService: PrestacionesService,
        public seguimientoPacientesService: SeguimientoPacientesService
    ) { }

    ngOnInit() {
        for (let conceptoGrafico of this.conceptosGrafico) {
            this.graficos.push(this.elementosRUPService.buscarElemento(conceptoGrafico, false));
        }
        // Loopeamos los conceptos que no son graficos y recupermaos su ultimo registro
        for (let concepto of this.conceptos) {
            this.elementos = [...this.elementos, this.elementosRUPService.buscarElemento(concepto, false)];
            this.prestacionesService.getRegistrosHuds(this.paciente.id, '<<' + concepto.conceptId).subscribe(prestaciones => {
                if (prestaciones.length) {
                    this.registros = [...this.registros, prestaciones[prestaciones.length - 1]];

                }
            });

        }

        // Seguimiento paciente San Juan
        for (let concepto of this.conceptoSeguimientoPaciente) {
            this.elementoSeguimiento =  [...this.elementoSeguimiento, this.elementosRUPService.buscarElemento(concepto, false)];
        }

        this.seguimientoPacientesService.getRegistros({idPaciente: this.paciente.id}).subscribe(seguimientoPacientes => {
               if (seguimientoPacientes.length) {
                   for (let seguimientoPaciente of seguimientoPacientes) {
                        this.registrosSeguimiento = [...this.registrosSeguimiento, seguimientoPaciente];
                   }
               }
        });



    }
}
