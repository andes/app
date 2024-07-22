
import { Component, Input, OnInit } from '@angular/core';
import { PlanIndicacionesServices } from 'src/app/apps/rup/mapa-camas/services/plan-indicaciones.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { PrestacionesService } from '../../../services/prestaciones.service';

@Component({
    selector: 'detalle-registro-internacion',
    templateUrl: 'detalleRegistroInternacion.html',
    styleUrls: ['detalleRegistroInternacion.scss']
})

export class DetalleRegistroInternacionComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() internacion;

    public ready$ = this.elementosRUPService.ready;
    public registro;
    public prestacion;
    public indicaciones;
    public cacheRegistros;
    public tipo;
    public prestacionSeleccionada = [];
    public tiposPrestacion;
    public fechaInicio;
    public fechaFin;
    public mostrarMas = false;
    public colapsable = [];
    public paginacion = [];
    public maxSizePaginas = [10, 20, 30];
    public sizePagina = 30;
    public selectorSizePagina = 30;
    public pagina = 1;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        private planIndicacionesServices: PlanIndicacionesServices,
    ) {
    }

    ngOnInit() {
        const { data: { id, index, registros, fechaIngreso } } = this.internacion;

        this.cargarRegistros(id, registros, index, fechaIngreso);
    }

    esPlanIndicacion(registro) {
        return registro.conceptId && ['33633005', '430147008'].includes(registro.conceptId);
    }

    cargarRegistros(idInternacion, registros, index, fechaIngreso) {
        this.registro = registros[index];

        if (this.esPlanIndicacion(this.registro)) {
            this.tipo = 'planIndicaciones';
            this.getIndicaciones(this.registro.conceptId, idInternacion, fechaIngreso);
            this.getPrestacion(this.registro.idPrestacion);
        } else {
            this.registro = Object.values(this.registro);

            if (idInternacion) {
                this.tipo = 'registrosInternacion';
            } else {
                this.tipo = 'fueraDeInternacion';
                this.tiposPrestacion = this.registro.map(p => p.concepto);
            }

            this.actualizarPaginacion();
        }
    }

    getPrestacion(id) {
        this.servicioPrestacion.getById(id).subscribe((prestacion) => {
            this.prestacion = prestacion;
        });
    }

    getIndicaciones(conceptId, idInternacion, fecha) {
        this.planIndicacionesServices.getIndicaciones(idInternacion, fecha, 'medica', 'draft').subscribe((indicaciones) => {
            this.indicaciones = indicaciones.filter((indicacion) => indicacion.concepto.conceptId === conceptId).map((indicacion) => {
                const diasSuministro = moment().diff(moment(indicacion.fechaInicio), 'days');

                return { ...indicacion, diasSuministro };
            });
        });
    }

    filtrar() {
        let filtroIndicaciones = this.registro.slice();

        if (this.prestacionSeleccionada?.length) {
            const seleccion = this.prestacionSeleccionada.map(e => e.prestacion ? e.prestacion.conceptId : e.conceptId);

            filtroIndicaciones = filtroIndicaciones.filter(p => seleccion.includes(p.concepto?.conceptId || p.prestacion?.conceptId));
        }

        if (this.fechaInicio || this.fechaFin) {
            filtroIndicaciones = filtroIndicaciones.filter(p => {
                const inicio = this.fechaInicio && moment(this.fechaInicio).startOf('day').toDate();
                const fin = this.fechaFin && moment(this.fechaFin).endOf('day').toDate();
                const fecha = p.createdAt || p.fecha;

                return inicio && fin ? moment(fecha).isSameOrAfter(inicio) && moment(fecha).isSameOrBefore(fin)
                    : inicio && !fin ? moment(fecha).isSameOrAfter(inicio)
                        : moment(fecha).isSameOrBefore(fin);
            });
        }

        this.indicaciones = filtroIndicaciones;
    }

    colapsar(index) {
        const position = this.colapsable.findIndex((i) => i === index);

        position > -1 ?
            this.colapsable.splice(position, 1)
            : this.colapsable.push(index);
    }

    mostrar() {
        this.mostrarMas = !this.mostrarMas;
    }

    actualizarPaginacion() {
        const startIndex = (this.pagina - 1) * this.sizePagina;
        const endIndex = startIndex + this.sizePagina;

        this.paginacion = this.registro.slice(startIndex, endIndex);
    }

    primera() {
        this.pagina = 1;
        this.actualizarPaginacion();
    }

    ultima() {
        this.pagina = this.totalPaginas();
        this.actualizarPaginacion();
    }

    siguiente() {
        if ((this.pagina * this.sizePagina) < this.registro.length) {
            this.pagina++;
            this.actualizarPaginacion();
        }
    }

    anterior() {
        if (this.pagina > 1) {
            this.pagina--;
            this.actualizarPaginacion();
        }
    }

    setNumeroPagina(page: number) {
        const totalPaginas = this.totalPaginas();

        if (!page || page < 1 || page > totalPaginas) {
            return;
        }

        this.pagina = page;
        this.actualizarPaginacion();
    }

    haySiguiente() {
        return (this.pagina * this.sizePagina) < this.registro.length;
    }

    hayAnterior() {
        return this.pagina !== 1;
    }

    totalPaginas() {
        return Math.ceil(this.registro.length / this.sizePagina);
    }

    setTotalPaginas(total) {
        this.sizePagina = Number(total);
        this.pagina = 1;
        this.actualizarPaginacion();
    }

    getTag(concepto, esSolicitud) {
        if (esSolicitud) {
            return 'solicitud';
        }

        if (concepto.includes('tratamiento') || concepto.includes('entidad observable')) {
            return 'procedimiento';
        } else if (concepto.includes('registro')) {
            return 'registro';
        } else if (concepto.includes('fármaco')) {
            return 'producto';
        }
        return concepto;
    }
}
