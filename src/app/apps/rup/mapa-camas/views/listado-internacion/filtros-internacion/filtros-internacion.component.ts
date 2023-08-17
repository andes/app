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
        this.resetFiltros();
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
                const unidades = [];
                listado.forEach(int => {
                    if (int.unidadOrganizativa && !unidades.some(u => u?.term === int.unidadOrganizativa.term)) {
                        unidades.push(int.unidadOrganizativa);
                    }
                });
                return unidades;
            })
        );
    }

    resetFiltros() {
        this.listadoInternacionService.pacienteText.next(null);
        this.listadoInternacionService.estado.next(null);
        this.listadoInternacionService.obraSocial.next(null);
        this.listadoInternacionService.unidadOrganizativa.next(null);
        this.filtrarFecha();
    }

    filtrar() {
        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        this.listadoInternacionService.estado.next(this.filtros.estado?.id);
        this.listadoInternacionService.obraSocial.next(this.filtros.obraSocial);
        this.listadoInternacionService.unidadOrganizativa.next(this.filtros.unidadOrganizativa);
    }

    filtrarFecha() {
        this.listadoInternacionService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        this.listadoInternacionService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
        this.listadoInternacionService.fechaEgresoDesde.next(this.filtros.fechaEgresoDesde);
        this.listadoInternacionService.fechaEgresoHasta.next(this.filtros.fechaEgresoHasta);
    }

    reporteInternaciones() {
        const params = {
            desde: this.filtros.fechaIngresoDesde ? moment(this.filtros.fechaIngresoDesde).startOf('d').format() : undefined,
            hasta: this.filtros.fechaIngresoHasta ? moment(this.filtros.fechaIngresoHasta).startOf('d').format() : undefined,
            egresoDesde: this.filtros.fechaEgresoDesde ? moment(this.filtros.fechaEgresoDesde).startOf('d').format() : undefined,
            egresoHasta: this.filtros.fechaEgresoHasta ? moment(this.filtros.fechaEgresoHasta).endOf('d').format() : undefined,
            organizacionOrigen: this.auth.organizacion.id
        };
        this.requestInProgress = true;
        this.servicioDocumentos.descargarReporteInternaciones(params, 'Internaciones').subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }
}

