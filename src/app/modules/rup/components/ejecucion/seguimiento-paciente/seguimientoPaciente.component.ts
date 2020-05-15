import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';
import { ISeguimientoPaciente } from '../../../interfaces/seguimientoPaciente.interface';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { SeguimientoPacientesService } from '../../../services/seguimientoPacientes.service';

@Component({
    selector: 'rup-seguimientoPaciente',
    templateUrl: 'seguimientoPaciente.html'
})
export class SeguimientoPacienteComponent implements OnInit {
    @Input() paciente: IPaciente;

    public registrosSeguimiento: ISeguimientoPaciente[] = [];
    public elementoSeguimiento: any[] = [];

    conceptoSeguimientoPaciente: ISnomedConcept[] = [
        {
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
        public seguimientoPacientesService: SeguimientoPacientesService
    ) { }

    ngOnInit() {

        // Seguimiento paciente San Juan
        this.elementoSeguimiento = this.conceptoSeguimientoPaciente.map(concepto => this.elementosRUPService.buscarElemento(concepto, false));

        this.seguimientoPacientesService.getRegistros({idPaciente: this.paciente.id}).subscribe(seguimientoPacientes => {
               if (seguimientoPacientes.length) {
                    this.registrosSeguimiento = seguimientoPacientes;
               }
        });



    }
}






