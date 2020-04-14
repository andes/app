import { Component, OnInit } from '@angular/core';
import * as enumerados from '../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { saveAs } from 'file-saver';
import { Slug } from 'ng2-slugify';
import { ListadoInternacionService } from '../listado-internacion.service';

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
        private listadoInternacionService: ListadoInternacionService,
        private servicioDocumentos: DocumentosService
    ) { }

    ngOnInit() {
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
        this.permisoDescarga = this.auth.check('internacion:descargarListado');
    }

    filtrar() {
        this.listadoInternacionService.pacienteDocumento.next(this.filtros.documento);
        this.listadoInternacionService.pacienteApellido.next(this.filtros.apellido);
        if (this.filtros.estado) {
            this.listadoInternacionService.estado.next(this.filtros.estado.id);
        }
    }

    filtrarFecha() {
        this.listadoInternacionService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        this.listadoInternacionService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
    }

    reporteInternaciones() {
        const params = {
            desde: moment(this.filtros.fechaIngresoDesde).startOf('d').format(),
            hasta: moment(this.filtros.fechaIngresoHasta).endOf('d').format(),
            organizacion: this.auth.organizacion.id
        };
        this.servicioDocumentos.descargarReporteInternaciones(params).subscribe(data => {
            let blob = new Blob([data], { type: data.type });
            saveAs(blob, this.slug.slugify('Internaciones' + ' ' + moment().format('DD-MM-YYYY-hmmss')) + '.csv');
        });
    }
}
