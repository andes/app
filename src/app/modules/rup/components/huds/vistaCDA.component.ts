import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CDAService } from '../../services/CDA.service';

@Component({
    selector: 'vista-cda',
    templateUrl: 'vistaCDA.html',
    styleUrls: ['vistaCDA.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class VistaCDAComponent implements OnInit {

    @Input() registro;

    archivo;

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

    descargarCDA(registro) {
        const metadata = {
            id: registro.data.id,
            prestacion: registro.data.prestacion,
            fecha: registro.data.fecha,
            idPaciente: registro.data.paciente,
            profesional: registro.data.profesional,
            organizacion: registro.data.organizacion,
            codificacion: this.codificacionCDA
        };
        this.servicioCDA.descargarCDA(metadata, registro.data.prestacion.snomed.term).subscribe();
    }
}
