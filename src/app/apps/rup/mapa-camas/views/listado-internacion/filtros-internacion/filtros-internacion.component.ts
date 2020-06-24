import { Component, OnInit } from '@angular/core';
import * as enumerados from '../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { ListadoInternacionService } from '../listado-internacion.service';

@Component({
    selector: 'app-filtros-internacion',
    templateUrl: './filtros-internacion.component.html',
})

export class FiltrosInternacionComponent implements OnInit {
    filtros: any = {
        fechaIngresoDesde: moment().subtract(1, 'months').toDate(),
        fechaIngresoHasta: moment().toDate(),
        fechaEgresoDesde: null,
        fechaEgresoHasta: null
    };
    estadosInternacion;
    permisoDescarga;
    requestInProgress: boolean;

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
        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        if (this.filtros.estado) {
            this.listadoInternacionService.estado.next(this.filtros.estado.id);
        } else {
            this.listadoInternacionService.estado.next(null);
        }
    }

    filtrarFecha() {
        if (moment(this.filtros.fechaIngresoDesde).isValid()) {
            this.listadoInternacionService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        }

        if (moment(this.filtros.fechaIngresoHasta).isValid()) {
            this.listadoInternacionService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
        }

        this.listadoInternacionService.fechaEgresoDesde.next(this.filtros.fechaEgresoDesde);
        this.listadoInternacionService.fechaEgresoHasta.next(this.filtros.fechaEgresoHasta);
    }

    reporteInternaciones() {
        const params = {
            ingresoDesde: moment(this.filtros.fechaIngresoDesde).startOf('d').format(),
            egresoDesde: moment(this.filtros.fechaEgresoDesde).startOf('d').format(),
            ingresoHasta: moment(this.filtros.fechaIngresoHasta).endOf('d').format(),
            egresoHasta: moment(this.filtros.fechaEgresoHasta).endOf('d').format(),
            organizacion: this.auth.organizacion.id
        };
        this.requestInProgress = true;
        this.servicioDocumentos.descargarReporteInternaciones(params, 'Internaciones').subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }
}
