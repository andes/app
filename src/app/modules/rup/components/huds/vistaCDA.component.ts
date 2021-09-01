import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CDAService } from '../../services/CDA.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'vista-cda',
    templateUrl: 'vistaCDA.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaCDAComponent implements OnInit {

    @Input() registro: any = {}; // 12948300

    archivo: any;

    public codificacionCDA = null;
    public autorCDA = null;
    public organizacionCDA = null;

    constructor(private servicioCDA: CDAService) { }

    ngOnInit() {
        this.servicioCDA.getJson(this.registro.data.cda_id).subscribe(cda => {
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
