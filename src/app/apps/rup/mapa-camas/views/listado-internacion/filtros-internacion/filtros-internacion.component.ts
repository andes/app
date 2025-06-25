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

    // Almacenar las fechas anteriores para comparar
    private fechasAnteriores = {
        fechaIngresoDesde: null,
        fechaIngresoHasta: null,
        fechaEgresoDesde: null,
        fechaEgresoHasta: null
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

        // Inicializar fechas anteriores
        this.fechasAnteriores = {
            fechaIngresoDesde: null,
            fechaIngresoHasta: null,
            fechaEgresoDesde: null,
            fechaEgresoHasta: null
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
                return false;
            }
        }

        if (this.filtros.fechaEgresoDesde && this.filtros.fechaEgresoHasta) {
            const diff = moment(this.filtros.fechaEgresoHasta).diff(moment(this.filtros.fechaEgresoDesde), 'months', true);
            if (diff > 3) {
                this.plex.info('warning', 'El intervalo máximo de búsqueda de egreso es de 3 meses');
                return false;
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

        // Siempre actualizar los filtros que no son de fecha
        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        this.listadoInternacionService.estado.next(this.filtros.estado?.id);
        this.listadoInternacionService.obraSocial.next(this.filtros.obraSocial);
        this.listadoInternacionService.unidadOrganizativa.next(this.filtros.unidadOrganizativa);

        // Verificar si cambiaron las fechas
        const fechasCambiadas = this.verificarCambioFechas();

        if (fechasCambiadas) {
            // Solo actualizar las fechas si cambiaron
            this.filtrarFecha();

            // Actualizar las fechas anteriores
            this.actualizarFechasAnteriores();
        }

        this.buscando.emit(false);
    }

    // Método para verificar si cambiaron las fechas
    verificarCambioFechas(): boolean {
        // Comparar fechas actuales con las anteriores
        const fechaIngresoDesdeChanged = !this.sonFechasIguales(this.filtros.fechaIngresoDesde, this.fechasAnteriores.fechaIngresoDesde);
        const fechaIngresoHastaChanged = !this.sonFechasIguales(this.filtros.fechaIngresoHasta, this.fechasAnteriores.fechaIngresoHasta);
        const fechaEgresoDesdeChanged = !this.sonFechasIguales(this.filtros.fechaEgresoDesde, this.fechasAnteriores.fechaEgresoDesde);
        const fechaEgresoHastaChanged = !this.sonFechasIguales(this.filtros.fechaEgresoHasta, this.fechasAnteriores.fechaEgresoHasta);

        return fechaIngresoDesdeChanged || fechaIngresoHastaChanged || fechaEgresoDesdeChanged || fechaEgresoHastaChanged;
    }

    // Método para comparar fechas (considerando null/undefined)
    sonFechasIguales(fecha1: Date, fecha2: Date): boolean {
        if (!fecha1 && !fecha2) {
            return true; // Ambas son null/undefined
        }
        if (!fecha1 || !fecha2) {
            return false; // Una es null y la otra no
        }
        return moment(fecha1).isSame(moment(fecha2), 'day');
    }

    // Método para actualizar las fechas anteriores
    actualizarFechasAnteriores() {
        this.fechasAnteriores = {
            fechaIngresoDesde: this.filtros.fechaIngresoDesde ? new Date(this.filtros.fechaIngresoDesde) : null,
            fechaIngresoHasta: this.filtros.fechaIngresoHasta ? new Date(this.filtros.fechaIngresoHasta) : null,
            fechaEgresoDesde: this.filtros.fechaEgresoDesde ? new Date(this.filtros.fechaEgresoDesde) : null,
            fechaEgresoHasta: this.filtros.fechaEgresoHasta ? new Date(this.filtros.fechaEgresoHasta) : null
        };
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

