import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { arrayToSet } from '@andes/shared';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentosService } from '../../../../../../services/documentos.service';
import * as enumerados from '../../../../../../utils/enumerados';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ListadoInternacionService } from '../listado-internacion.service';
import * as moment from 'moment';

@Component({
    selector: 'app-filtros-internacion',
    templateUrl: './filtros-internacion.component.html',
})

export class FiltrosInternacionComponent implements OnInit {
    filtros: any = {
        fechaIngresoDesde: null,
        fechaIngresoHasta: null,
        fechaEgresoDesde: null,
        fechaEgresoHasta: null,
        paciente: null,
        estado: null,
        obraSocial: null,
        unidadOrganizativa: null
    };
    estadosInternacion;
    requestInProgress: boolean;
    unidadesOrganizativas$: Observable<any[]>;
    obraSociales$: Observable<any[]>;

    constructor(
        private auth: Auth,
        private listadoInternacionService: ListadoInternacionService,
        private servicioDocumentos: DocumentosService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private plex: Plex
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
        // Inicializar los filtros en blanco
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

        // Limpiar los filtros en el servicio pero sin ejecutar la búsqueda
        this.listadoInternacionService.pacienteText.next(null);
        this.listadoInternacionService.estado.next(null);
        this.listadoInternacionService.obraSocial.next(null);
        this.listadoInternacionService.unidadOrganizativa.next(null);
        this.listadoInternacionService.fechaIngresoDesde.next(null);
        this.listadoInternacionService.fechaIngresoHasta.next(null);
        this.listadoInternacionService.fechaEgresoDesde.next(null);
        this.listadoInternacionService.fechaEgresoHasta.next(null);
    }

    validarRangoFechas(tipo: string) {
        if (tipo === 'ingreso') {
            if (this.filtros.fechaIngresoDesde && this.filtros.fechaIngresoHasta) {
                const diff = moment(this.filtros.fechaIngresoHasta).diff(moment(this.filtros.fechaIngresoDesde), 'months', true);
                if (diff > 1) {
                    this.filtros.fechaIngresoHasta = moment(this.filtros.fechaIngresoDesde).add(1, 'month').toDate();
                }
            }
        } else if (tipo === 'egreso') {
            if (this.filtros.fechaEgresoDesde && this.filtros.fechaEgresoHasta) {
                const diff = moment(this.filtros.fechaEgresoHasta).diff(moment(this.filtros.fechaEgresoDesde), 'months', true);
                if (diff > 1) {
                    this.filtros.fechaEgresoHasta = moment(this.filtros.fechaEgresoDesde).add(1, 'month').toDate();
                }
            }
        }
    }

    /**
     * Verifica si una fecha es válida
     */
    esFechaValida(fecha: any): boolean {
        if (!fecha) {
            return true;
        }

        // Si es un string, intentar convertirlo a fecha
        if (typeof fecha === 'string') {
            const fechaMoment = moment(fecha, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
            return fechaMoment.isValid();
        }

        // Si ya es un objeto Date, verificar que sea válido
        if (fecha instanceof Date) {
            return !isNaN(fecha.getTime());
        }

        return false;
    }

    validarTodasLasFechas(): boolean {
        // Validar que las fechas tengan formato correcto
        const fechasValidas =
            this.esFechaValida(this.filtros.fechaIngresoDesde) &&
            this.esFechaValida(this.filtros.fechaIngresoHasta) &&
            this.esFechaValida(this.filtros.fechaEgresoDesde) &&
            this.esFechaValida(this.filtros.fechaEgresoHasta);

        if (!fechasValidas) {
            this.plex.info('warning', 'Hay fechas ingresadas que no son válidas');
            return false;
        }

        // Validar el rango de fechas de ingreso
        if (this.filtros.fechaIngresoDesde && this.filtros.fechaIngresoHasta) {
            const diff = moment(this.filtros.fechaIngresoHasta).diff(moment(this.filtros.fechaIngresoDesde), 'months', true);
            if (diff > 1) {
                this.plex.info('warning', 'El intervalo máximo de búsqueda de ingreso es de un mes');
                // Ajustar automáticamente la fecha
                this.filtros.fechaIngresoHasta = moment(this.filtros.fechaIngresoDesde).add(1, 'month').toDate();
            }
        }

        // Validar el rango de fechas de egreso
        if (this.filtros.fechaEgresoDesde && this.filtros.fechaEgresoHasta) {
            const diff = moment(this.filtros.fechaEgresoHasta).diff(moment(this.filtros.fechaEgresoDesde), 'months', true);
            if (diff > 1) {
                this.plex.info('warning', 'El intervalo máximo de búsqueda de egreso es de un mes');
                // Ajustar automáticamente la fecha
                this.filtros.fechaEgresoHasta = moment(this.filtros.fechaEgresoDesde).add(1, 'month').toDate();
            }
        }

        return true;
    }

    filtrar() {
        if (!this.validarTodasLasFechas()) {
            return;
        }

        this.listadoInternacionService.pacienteText.next(this.filtros.paciente);
        this.listadoInternacionService.estado.next(this.filtros.estado?.id);
        this.listadoInternacionService.obraSocial.next(this.filtros.obraSocial);
        this.listadoInternacionService.unidadOrganizativa.next(this.filtros.unidadOrganizativa);

        this.filtrarFecha();
    }

    filtrarFecha() {
        this.listadoInternacionService.fechaIngresoDesde.next(this.filtros.fechaIngresoDesde);
        this.listadoInternacionService.fechaIngresoHasta.next(this.filtros.fechaIngresoHasta);
        this.listadoInternacionService.fechaEgresoDesde.next(this.filtros.fechaEgresoDesde);
        this.listadoInternacionService.fechaEgresoHasta.next(this.filtros.fechaEgresoHasta);
    }

    reporteInternaciones() {
        // Validar que haya fechas seleccionadas y que sean válidas
        if (!this.filtros.fechaIngresoDesde && !this.filtros.fechaEgresoDesde) {
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

