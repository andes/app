import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IPSService } from '../../services/dominios-nacionales.service';

@Component({
    selector: 'vista-ips',
    templateUrl: 'vista-ips.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        '../core/_rup.scss'
    ]
})

export class VistaIPSComponent implements OnInit {
    @Input() registro: any = {};
    public ips = false;
    constructor(
        public ipsService: IPSService
    ) { }

    composition: any;

    vacunas: any[] = [];
    medicamentos: any[] = [];
    problemas: any[] = [];
    alergias: any[] = [];

    ngOnInit() {
        const EMPTY_ENTRY = 'http://hl7.org/fhir/uv/ips/CodeSystem/absent-unknown-uv-ips';
        this.ipsService.getDocumentos(this.registro.params).subscribe(result => {
            if (result && result.resourceType) {
                this.composition = result.entry.find(entry => entry.resource.resourceType === 'Composition').resource;

                this.vacunas = result.entry.filter(entry => entry.resource.resourceType === 'Immunization').map(e => e.resource);
                this.medicamentos = result.entry.filter(entry => entry.resource.resourceType === 'MedicationStatement').map(e => e.resource);
                this.problemas = result.entry.filter(entry => entry.resource.resourceType === 'Condition').map(e => e.resource);
                this.alergias = result.entry.filter(entry => entry.resource.resourceType === 'AllergyIntolerance').map(e => e.resource);

                // Filtramos las secciones vacías
                this.vacunas = this.vacunas.filter(item => item.vaccineCode.coding[0].system !== EMPTY_ENTRY);
                this.problemas = this.problemas.filter(item => item.code.coding[0].system !== EMPTY_ENTRY);
                this.alergias = this.alergias.filter(item => item.code.coding[0].system !== EMPTY_ENTRY);
                this.medicamentos = this.medicamentos.filter(item => item.medicationCodeableConcept?.coding[0].system !== EMPTY_ENTRY);

                this.medicamentos.forEach(medicamento => {
                    if (!medicamento.medicationCodeableConcept) {
                        const med = result.entry.find(r => r.fullUrl === medicamento.medicationReference.reference);
                        if (med) {
                            medicamento.medicationCodeableConcept = med.resource.code;
                        }
                    }
                });

            } else {
                this.composition = {
                    title: 'No existen registros'
                };
            }
            this.ips = true;
        });
    }


}
