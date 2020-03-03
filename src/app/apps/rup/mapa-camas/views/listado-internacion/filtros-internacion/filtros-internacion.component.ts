import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import * as enumerados from '../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { saveAs } from 'file-saver';
import { Slug } from 'ng2-slugify';

@Component({
    selector: 'app-filtros-internacion',
    templateUrl: './filtros-internacion.component.html',
})

export class FiltrosInternacionComponent implements OnInit {
    filtros: any = {
        fechaIngresoDesde: moment().subtract(1, 'months').toDate(),
        fechaIngresoHasta: moment().toDate()
    };
    estadosInternacion;
    permisoDescarga;

    private slug = new Slug('default'); // para documento csv

    constructor(
        private auth: Auth,
        private mapaCamasService: MapaCamasService,
        private servicioDocumentos: DocumentosService
    ) { }

    ngOnInit() {
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
        this.permisoDescarga = this.auth.check('internacion:descargarListado');
    }

    filtrar() {
        this.mapaCamasService.pacienteDocumento.next(this.filtros.documento);
        this.mapaCamasService.pacienteApellido.next(this.filtros.apellido);
        if (this.filtros.estado) {
            this.mapaCamasService.estado.next(this.filtros.estado.id);
        }
    }

    filtrarFecha() {
        this.mapaCamasService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        this.mapaCamasService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
    }

    reporteInternaciones() {
        this.servicioDocumentos.descargarReporteInternaciones({ filtros: this.filtros, organizacion: this.auth.organizacion.id }).subscribe(data => {
            let blob = new Blob([data], { type: data.type });
            saveAs(blob, this.slug.slugify('Internaciones' + ' ' + moment().format('DD-MM-YYYY-hmmss')) + '.xlsx');
        });
    }
}
