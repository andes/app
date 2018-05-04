import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { CamasService } from '../../../../../services/camas.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { InternacionService } from '../../../services/internacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';
import { DocumentosService } from '../../../../../services/documentos.service';

@Component({
    templateUrl: 'censoMensual.html'
})

export class CensoMensualComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public organizacion;
    public fecha = new Date();
    public fechaHasta;
    public organizacionSeleccionada;
    public listadoCenso = [];
    public ingresoEgreso = {};
    public resumenCensoTotal;

    public snomedEgreso = {
        conceptId: '58000006',
        term: 'alta del paciente',
        fsn: 'alta del paciente (procedimiento)',
        semanticTag: 'procedimiento'
    };


    public totalResumenCenso = {
        existencia0: 0,
        ingresos: 0,
        pasesDe: 0,
        egresosAlta: 0,
        egresosDefuncion: 0,
        pasesA: 0,
        existencia24: 0,
        ingresoEgresoDia: 0,
        pacientesDia: 0,
        disponibles24: 0,
        disponibles0: 0
    };
    // Usa el keymap 'default'
    private slug = new Slug('default');
    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private organizacionService: OrganizacionService,
        private servicioDocumentos: DocumentosService,
        private sanitizer: DomSanitizer,
        private servicioInternacion: InternacionService) { }

    ngOnInit() {

        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
        });
    }

    generarCenso() {
        let params = {
            fechaDesde: moment(this.fecha).endOf('day'),
            fechaHasta: moment(this.fechaHasta).endOf('day'),
            unidad: this.organizacionSeleccionada.conceptId
        };
        this.servicioInternacion.getCensoMensual(params).subscribe((respuesta: any) => {
            this.resumenCensoTotal = respuesta;

            this.totalCenso();
            // this.completarResumenDiario();
        });
    }


    totalCenso() {
        this.totalResumenCenso = {
            existencia0: 0,
            ingresos: 0,
            pasesDe: 0,
            egresosAlta: 0,
            egresosDefuncion: 0,
            pasesA: 0,
            existencia24: 0,
            ingresoEgresoDia: 0,
            pacientesDia: 0,
            disponibles24: 0,
            disponibles0: 0
        };
        this.resumenCensoTotal.forEach(element => {
            this.totalResumenCenso.existencia0 += element.resumen.existencia0;
            this.totalResumenCenso.ingresos += element.resumen.ingresos;
            this.totalResumenCenso.pasesDe += element.resumen.pasesDe;
            this.totalResumenCenso.egresosAlta += element.resumen.egresosAlta;
            this.totalResumenCenso.egresosDefuncion += element.resumen.egresosDefuncion;
            this.totalResumenCenso.pasesA += element.resumen.pasesA;
            this.totalResumenCenso.existencia24 += element.resumen.existencia24;
            this.totalResumenCenso.ingresoEgresoDia += element.resumen.ingresoEgresoDia;
            this.totalResumenCenso.pacientesDia += element.resumen.pacientesDia;
            this.totalResumenCenso.disponibles24 += element.resumen.disponibles24;
            this.totalResumenCenso.disponibles0 += element.resumen.disponibles0;

        });
    }

    reseteaBusqueda() {
        this.listadoCenso = [];
    }


    descargarCensoMensual() {
        setTimeout(() => {

            let content = '';
            let tabla = document.getElementById('tabla');
            content += tabla.innerHTML;
            let scssFile = '../censo/censoDiario';
            this.servicioDocumentos.descargar(content, scssFile, true).subscribe(data => {
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
        let nombreArchivo = this.slug.slugify('CENSOMENSUAL' + '-' + moment().format('DD-MM-YYYY-hmmss')) + '.pdf';
        saveAs(blob, nombreArchivo);
    }

    /**
     * Vuelve a la página anterior (mapa de camas)
     */
    mapaDeCamas() {
        this.router.navigate(['mapa-de-camas']);
    }

}
