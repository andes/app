import moment from 'moment';
import { Component, OnInit } from '@angular/core';
import * as enumerados from '../../../../../../utils/enumerados';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ListadoInternacionCapasService } from '../listado-internacion-capas.service';

@Component({
    selector: 'app-filtros-listado-capas',
    templateUrl: './filtros-listado-capas.component.html',
})

export class FiltrosListadoCapasComponent implements OnInit {
    filtros: any = {
        fechaIngresoDesde: moment().subtract(1, 'months').toDate(),
        fechaIngresoHasta: moment().toDate(),
        fechaEgresoDesde: null,
        fechaEgresoHasta: null
    };
    estadosInternacion;
    requestInProgress: boolean;

    constructor(
        private listadoInternacionService: ListadoInternacionCapasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
    ) { }

    ngOnInit() {
        this.resetFiltros();
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
    }

    resetFiltros() {
        this.listadoInternacionService.pacienteText.next(null);
        this.listadoInternacionService.estado.next(null);
        this.filtrarFecha();
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
        this.listadoInternacionService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        this.listadoInternacionService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
        this.listadoInternacionService.fechaEgresoDesde.next(this.filtros.fechaEgresoDesde);
        this.listadoInternacionService.fechaEgresoHasta.next(this.filtros.fechaEgresoHasta);
    }
}
