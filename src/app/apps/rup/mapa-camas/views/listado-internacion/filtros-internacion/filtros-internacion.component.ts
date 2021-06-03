import { Component, OnInit } from '@angular/core';
import * as enumerados from '../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { ListadoInternacionService } from '../listado-internacion.service';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { arrayToSet } from '@andes/shared';

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
    unidadesOrganizativas$: Observable<any[]>;

    obraSociales$: Observable<any[]>;

    constructor(
        private auth: Auth,
        private listadoInternacionService: ListadoInternacionService,
        private servicioDocumentos: DocumentosService,
        public permisosMapaCamasService: PermisosMapaCamasService
    ) { }

    ngOnInit() {
        this.estadosInternacion = enumerados.getObjEstadoInternacion();

        this.obraSociales$ = this.listadoInternacionService.listaInternacion$.pipe(
            map((prestaciones) => {
                const rs = arrayToSet(prestaciones, 'nombre', (item) => item.paciente.obraSocial);
                rs.push({
                    _id: 'sin-obra-social',
                    nombre: 'SIN OBRA SOCIAL'
                });
                return rs;
            })
        );

        this.unidadesOrganizativas$ = this.listadoInternacionService.listaInternacion$.pipe(
            map(listado => {
                let unidades = [];
                listado.forEach(int => {
                    if (int.unidadOrganizativa && !unidades.some(u => u?.term === int.unidadOrganizativa.term)) {
                        unidades.push(int.unidadOrganizativa);
                    }
                });
                return unidades;
            })
        );
    }

    filtrar() {
        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        this.listadoInternacionService.estado.next(this.filtros.estado?.id);
        this.listadoInternacionService.obraSocial.next(this.filtros.obraSocial);
        this.listadoInternacionService.unidadOrganizativa.next(this.filtros.unidadOrganizativa);
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
}

