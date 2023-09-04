import { Component, Input, OnChanges } from '@angular/core';
import { CDAService } from 'src/app/modules/rup/services/CDA.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'vista-cda',
    templateUrl: 'vista-cda.component.html',
    styleUrls: ['./vista-cda.component.scss']
})

export class VistaCDAComponent implements OnChanges {
    @Input() registro;

    public codificacionCDA = null;
    public autorCDA = null;
    public organizacionCDA = null;

    constructor(private servicioCDA: CDAService) { }

    ngOnChanges(changes) {
        const registro = changes.registro.currentValue;

        this.servicioCDA.getJson(registro.cda_id).subscribe(cda => {
            this.autorCDA = cda.ClinicalDocument.author.assignedAuthor.assignedPerson ? cda.ClinicalDocument.author.assignedAuthor.assignedPerson.name : null;
            this.organizacionCDA = cda.ClinicalDocument.author.assignedAuthor.representedOrganization ? cda.ClinicalDocument.author.assignedAuthor.representedOrganization : null;
            this.codificacionCDA = cda.ClinicalDocument.component.structuredBody ? cda.ClinicalDocument.component.structuredBody.component.section : null;
        });

    }

    descargar(archivo) {
        const token = window.sessionStorage.getItem('jwt');
        const url = environment.API + '/modules/cda/' + archivo + '?token=' + token;
        window.open(url);
    }

}
