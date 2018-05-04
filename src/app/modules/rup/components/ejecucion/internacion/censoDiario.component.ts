import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { CamasService } from '../../../../../services/camas.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { InternacionService } from '../../../services/internacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import * as moment from 'moment';
import { forEach } from '@angular/router/src/utils/collection';
import { DocumentosService } from '../../../../../services/documentos.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';

@Component({
    templateUrl: 'censoDiario.html'
})

export class CensoDiarioComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public organizacion;
    public fecha = new Date();
    public organizacionSeleccionada;
    public listadoCenso = [];
    public ingresoEgreso = {};
    public resumenCenso;

    public snomedEgreso = {
        conceptId: '58000006',
        term: 'alta del paciente',
        fsn: 'alta del paciente (procedimiento)',
        semanticTag: 'procedimiento'
    };

    // Usa el keymap 'default'
    private slug = new Slug('default');

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private organizacionService: OrganizacionService,
        private servicioInternacion: InternacionService,
        private servicioDocumentos: DocumentosService,
        private sanitizer: DomSanitizer) { }

    ngOnInit() {

        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
        });
    }

    generarCenso() {
        let params = {
            fecha: moment(this.fecha).endOf('day'),
            unidad: this.organizacionSeleccionada.conceptId
        };
        this.servicioInternacion.getInfoCenso(params).subscribe((respuesta: any) => {
            this.listadoCenso = respuesta.censoDiario.map(c => c.censo);
            this.resumenCenso = respuesta.resumen;
            // this.completarResumenDiario();
        });
    }

    reseteaBusqueda() {
        this.listadoCenso = [];
    }

    descargarCenso() {
        setTimeout(() => {

            let content = '';
            let tabla = document.getElementById('tabla');
            content += tabla.innerHTML;
            let scssFile = '../censo/censoDiario';
            this.servicioDocumentos.descargar(content, scssFile).subscribe(data => {
                if (data) {
                    // Generar descarga como PDF
                    this.descargarArchivo(data, { type: 'application/pdf' });
                } else {
                    // Fallback a impresión normal desde el navegador
                    window.print();
                }
            });
        });
    }

    private descargarArchivo(data: any, headers: any): void {
        let blob = new Blob([data], headers);
        let nombreArchivo = this.slug.slugify('CENSODIARIO' + '-' + moment().format('DD-MM-YYYY-hmmss')) + '.pdf';
        saveAs(blob, nombreArchivo);
    }


    /**
    * Vuelve a la página anterior (mapa de camas)
    */
    mapaDeCamas() {
        this.router.navigate(['mapa-de-camas']);
    }
}
