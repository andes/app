import { Component, OnInit } from '@angular/core';
import * as enumerados from '../../../../../../utils/enumerados';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ListadoInternacionCapasService } from '../listado-internacion-capas.service';
import { Auth } from '@andes/auth';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-filtros-listado-capas',
    templateUrl: './filtros-listado-capas.component.html',
})

export class FiltrosListadoCapasComponent implements OnInit {
    filtros: any = {
        fechaIngresoDesde: moment().subtract(1, 'months').toDate(),
        fechaIngresoHasta: moment().toDate(),
        fechaEgresoDesde: null,
        fechaEgresoHasta: null,
        unidadOrganizativa: null
    };
    unidadesOrganizativas$: Observable<any[]>;
    estadosInternacion;
    requestInProgress: boolean;

    constructor(
        private listadoInternacionService: ListadoInternacionCapasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private auth: Auth,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        this.resetFiltros();
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
        this.unidadesOrganizativas$ = this.organizacionService.unidadesOrganizativas(this.auth.organizacion.id);
    }

    resetFiltros() {
        this.listadoInternacionService.pacienteText.next(null);
        this.listadoInternacionService.estado.next(null);
        this.listadoInternacionService.unidadOrganizativa.next(null);
        this.filtrarFecha();
    }

    filtrar() {
        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        if (this.filtros.estado) {
            this.listadoInternacionService.estado.next(this.filtros.estado.id);
        } else {
            this.listadoInternacionService.estado.next(null);
        }
        const unidadId = this.filtros.unidadOrganizativa?.conceptId || this.filtros.unidadOrganizativa;
        this.listadoInternacionService.unidadOrganizativa.next(unidadId);
    }

    filtrarFecha() {
        this.listadoInternacionService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        this.listadoInternacionService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
        this.listadoInternacionService.fechaEgresoDesde.next(this.filtros.fechaEgresoDesde);
        this.listadoInternacionService.fechaEgresoHasta.next(this.filtros.fechaEgresoHasta);
    }
}
