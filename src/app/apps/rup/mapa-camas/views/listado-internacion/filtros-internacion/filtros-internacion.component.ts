import { Component, OnInit } from '@angular/core';
import * as enumerados from '../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../../../services/documentos.service';
import { ListadoInternacionService } from '../listado-internacion.service';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { Observable } from 'rxjs/internal/Observable';
import { MapaCamasHTTP } from '../../../services/mapa-camas.http';
import { map } from 'rxjs/operators';
import { ObraSocialService } from 'src/app/services/obraSocial.service';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';

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
    obrasSociales$: Observable<IObraSocial[]>;

    constructor(
        private auth: Auth,
        private listadoInternacionService: ListadoInternacionService,
        private servicioDocumentos: DocumentosService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private camasHttp: MapaCamasHTTP,
        private obraSocialService: ObraSocialService
    ) { }

    ngOnInit() {
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
        this.unidadesOrganizativas$ = this.camasHttp.snapshot('internacion', 'estadistica', new Date()).pipe(
            map(camas => {
                let unidades = [];
                camas.forEach(cama => {
                    if (!unidades.some(u => u.id === cama.unidadOrganizativa.id)) {
                        unidades.push(cama.unidadOrganizativa);
                    }
                });
                return unidades;
            })
        );
    }

    filtrar() {
        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        this.listadoInternacionService.estado.next(this.filtros.estado?.id);
        this.listadoInternacionService.unidadOrganizativa.next(this.filtros.unidadOrganizativa);
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
