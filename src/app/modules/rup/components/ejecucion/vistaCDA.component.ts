import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { CDAService } from './../../services/CDA.service';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';
import { environment } from '../../../../../environments/environment';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'vista-cda',
    templateUrl: 'vistaCDA.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaCDAComponent implements OnInit {

    @Input() registro: any = {}; // 12948300
    public urlcda = null;
    archivo: any;

    // Usa el keymap 'default'
    private slug = new Slug('default');
    public dataXML = '';
    public codificacionCDA = null;
    public autorCDA = null;
    public organizacionCDA = null;

    constructor(private servicioCDA: CDAService, private sanitizer: DomSanitizer, private auth: Auth) { }

    ngOnInit() {

        let data = this.registro;
        this.servicioCDA.getJson(this.registro.data.cda_id).subscribe(
            cda => {
                this.autorCDA = cda.ClinicalDocument.author.assignedAuthor.assignedPerson ? cda.ClinicalDocument.author.assignedAuthor.assignedPerson : null;
                this.organizacionCDA = cda.ClinicalDocument.author.assignedAuthor.representedOrganization ? cda.ClinicalDocument.author.assignedAuthor.representedOrganization : null;
                this.codificacionCDA = cda.ClinicalDocument
                    .component.structuredBody.component.section ? cda.ClinicalDocument.component.structuredBody.component.section : null;

            });
    }

    descargar(archivo) {
        let token = window.sessionStorage.getItem('jwt');
        let url = environment.API + '/modules/cda/' + archivo + '?token=' + token;
        window.open(url);
    }
};
