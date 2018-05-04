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
    constructor(private servicioCDA: CDAService, private sanitizer: DomSanitizer, private auth: Auth) { }

    ngOnInit() {

        let data = this.registro;
        this.servicioCDA.getJson(this.registro.data.cda_id).subscribe(
            cda => {
                debugger
            });
        // let token = window.sessionStorage.getItem('jwt');
        // this.urlcda = this.sanitizer.bypassSecurityTrustResourceUrl(environment.API + '/modules/cda/' + this.registro.data.cda_id + '?token=' + token);
        // this.urlcda
        // debugger;

    }

    descargar(archivo) {
        let token = window.sessionStorage.getItem('jwt');
        let url = environment.API + '/modules/cda/' + archivo + '?token=' + token;
        window.open(url);
    }
};
