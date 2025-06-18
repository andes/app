import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ObraSocialService } from 'src/app/services/obraSocial.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { DocumentosService } from '../../../../../../services/documentos.service';
import * as enumerados from '../../../../../../utils/enumerados';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ListadoInternacionService } from '../listado-internacion.service';

@Component({
    selector: 'app-filtros-internacion',
    templateUrl: './filtros-internacion.component.html',
})

export class FiltrosInternacionComponent implements OnInit {
    @ViewChild('formFiltros', { read: NgForm }) formFiltros: NgForm;
    @Output() buscando = new EventEmitter<boolean>();

    public filtros: any = {
        fechaIngresoDesde: null,
        fechaIngresoHasta: null,
        fechaEgresoDesde: null,
        fechaEgresoHasta: null,
        paciente: null,
        estado: null,
        obraSocial: null,
        unidadOrganizativa: null
    };

    public estadosInternacion;
    public requestInProgress: boolean;
    public fechaHoy = moment().endOf('day');

    public unidadesOrganizativas$: Observable<any[]>;
    public obraSociales$: Observable<any[]>;

    constructor(
        private auth: Auth,
        private plex: Plex,
        private listadoInternacionService: ListadoInternacionService,
        private servicioDocumentos: DocumentosService,
        private organizacionService: OrganizacionService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        public obraSocialService: ObraSocialService
    ) { }

    ngOnInit() {
        this.initFiltros();
        this.estadosInternacion = enumerados.getObjEstadoInternacion();
        this.obraSociales$ = this.obraSocialService.getListado({});
        this.unidadesOrganizativas$ = this.organizacionService.unidadesOrganizativas(this.auth.organizacion.id);
    }

    initFiltros() {
        this.filtros = {
            fechaIngresoDesde: null,
            fechaIngresoHasta: null,
            fechaEgresoDesde: null,
            fechaEgresoHasta: null,
            paciente: null,
            estado: null,
            obraSocial: null,
            unidadOrganizativa: null
        };

        Object.keys(this.filtros).forEach(key => {
            this.listadoInternacionService[key]?.next(null);
        });
    }

    validarRangoFechas(tipo: string) {
        if (tipo === 'ingreso') {
            if (this.filtros.fechaIngresoDesde && this.filtros.fechaIngresoHasta) {
                const diff = moment(this.filtros.fechaIngresoHasta).diff(moment(this.filtros.fechaIngresoDesde), 'months', true);
                if (diff > 3) {
                    this.filtros.fechaIngresoHasta = moment(this.filtros.fechaIngresoDesde).add(3, 'month').toDate();
                }
            }
        } else if (tipo === 'egreso') {
            if (this.filtros.fechaEgresoDesde && this.filtros.fechaEgresoHasta) {
                const diff = moment(this.filtros.fechaEgresoHasta).diff(moment(this.filtros.fechaEgresoDesde), 'months', true);
                if (diff > 3) {
                    this.filtros.fechaEgresoHasta = moment(this.filtros.fechaEgresoDesde).add(3, 'month').toDate();
                }
            }
        }
    }

    validarTodasLasFechas(): boolean {
        if (!this.filtros.fechaIngresoDesde || !this.filtros.fechaIngresoHasta) {
            return false;
        }

        if (this.filtros.fechaIngresoDesde && this.filtros.fechaIngresoHasta) {
            const diff = moment(this.filtros.fechaIngresoHasta).diff(moment(this.filtros.fechaIngresoDesde), 'months', true);
            if (diff > 3) {
                this.plex.info('warning', 'El intervalo máximo de búsqueda de ingreso es de 3 meses');
            }
        }

        if (this.filtros.fechaEgresoDesde && this.filtros.fechaEgresoHasta) {
            const diff = moment(this.filtros.fechaEgresoHasta).diff(moment(this.filtros.fechaEgresoDesde), 'months', true);
            if (diff > 3) {
                this.plex.info('warning', 'El intervalo máximo de búsqueda de egreso es de 3 meses');
            }
        }

        return true;
    }

    async filtrar() {
        this.formFiltros.form.markAllAsTouched();

        if (!this.validarTodasLasFechas()) {
            return;
        }

        this.buscando.emit(true);

        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        this.listadoInternacionService.estado.next(this.filtros.estado?.id);
        this.listadoInternacionService.obraSocial.next(this.filtros.obraSocial);
        this.listadoInternacionService.unidadOrganizativa.next(this.filtros.unidadOrganizativa);

        this.filtrarFecha();

        this.buscando.emit(false);
    }

    filtrarFecha() {
        this.listadoInternacionService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        this.listadoInternacionService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
        this.listadoInternacionService.fechaEgresoDesde.next(this.filtros.fechaEgresoDesde);
        this.listadoInternacionService.fechaEgresoHasta.next(this.filtros.fechaEgresoHasta);
    }

    reporteInternaciones() {
        if (!this.filtros.fechaIngresoDesde || !this.filtros.fechaEgresoDesde) {
            this.plex.info('warning', 'Debe seleccionar al menos un rango de fechas para descargar el reporte');
            return;
        }

        if (!this.validarTodasLasFechas()) {
            return;
        }

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

