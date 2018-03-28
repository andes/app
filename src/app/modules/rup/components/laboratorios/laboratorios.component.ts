import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { CDAService } from './../../services/CDA.service';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';

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

    constructor(private servicioCDA: CDAService) { }

    ngOnInit() {
    }

    descargar(idArchivo) {
        this.servicioCDA.get(idArchivo).subscribe(lab => {
            console.log(lab);
            let blob = new Blob([lab], { type: 'application/pdf' });
            let nombreArchivo = this.slug.slugify(idArchivo); // por lo pronto no hace falta, pero puede que en el futuro lo haga
            saveAs(blob, nombreArchivo);
        });
    }
};
