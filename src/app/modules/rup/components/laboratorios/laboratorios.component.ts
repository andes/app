import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { CDAService } from './../../services/CDA.service';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'lab',
    templateUrl: 'laboratorios.html',
    encapsulation: ViewEncapsulation.None,
})

export class LaboratoriosComponent implements OnInit {

    @Input() laboratorio: any = {}; // 12948300

    archivo: any;

    // Usa el keymap 'default'
    private slug = new Slug('default');

    constructor(private servicioCDA: CDAService, private auth: Auth) { }

    ngOnInit() {
    }


    descargar(archivo) {
        let nombreArchivo = archivo.substring(0, archivo.lastIndexOf('.'));
        let token = window.sessionStorage.getItem('jwt');
        let url = environment.API + '/modules/cda/' + nombreArchivo + '?token=' + token;
        window.open(url);
    }
};
