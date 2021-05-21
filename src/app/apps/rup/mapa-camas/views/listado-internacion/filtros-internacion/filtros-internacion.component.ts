import { Component, OnInit } from '@angular/core';
import * as enumerados from '../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { ListadoInternacionService } from '../listado-internacion.service';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ObraSocialService } from 'src/app/services/obraSocial.service';

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
    requestInProgress: boolean;

    constructor(
        private auth: Auth,
        private listadoInternacionService: ListadoInternacionService,
        private servicioDocumentos: DocumentosService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private obraSocialService: ObraSocialService
    ) { }

    ngOnInit() {
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
    }

    filtrar() {
        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        this.listadoInternacionService.estado.next(this.filtros.estado?.id);
        this.listadoInternacionService.obraSocial.next(this.filtros.obraSocial);
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
            desde: moment(this.filtros.fechaIngresoDesde).startOf('d').format(),
            hasta: moment(this.filtros.fechaIngresoHasta).endOf('d').format(),
            organizacion: this.auth.organizacion.id
        };
        this.requestInProgress = true;
        this.servicioDocumentos.descargarReporteInternaciones(params, 'Internaciones').subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }

    loadObrasSociales(event) {
        if (event.query) {
            this.obraSocialService.getListado({ nombre: event.query }).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            event.callback(null);
        }
    }
}
