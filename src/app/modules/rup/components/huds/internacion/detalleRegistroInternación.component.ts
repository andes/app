
import { Component, Input, OnInit } from '@angular/core';
import { PlanIndicacionesServices } from 'src/app/apps/rup/mapa-camas/services/plan-indicaciones.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'detalle-registro-internacion',
    templateUrl: 'detalleRegistroInternacion.html',
    styleUrls: ['detalleRegistroInternacion.scss']
})

export class DetalleRegistroInternacionComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() internacion;

    public ready$ = this.elementosRUPService.ready;
    public mostrarMas = false;
    public registro;
    public prestacion;
    public indicaciones;
    public tipo;
    public prestacionSeleccionada = [];
    public tiposPrestacion;
    public indicacionesCache;
    public fechaInicio;
    public fechaFin;
    public requestInProgress = false;
    public puedeDescargarInforme = false;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        private planIndicacionesServices: PlanIndicacionesServices,
        private servicioDocumentos: DocumentosService,
        private auth: Auth
    ) { }

    ngOnInit() {
        const { data: { id, index, registros, indices, fechaIngreso } } = this.internacion;
        this.puedeDescargarInforme = this.auth.check('huds:impresion');
        if (id) {
            if (registros) {
                this.registro = registros[index];
                this.tipo = 'internacion';

                if (this.registro.conceptId) {
                    this.getPrestacion(this.registro.idPrestacion);
                    this.filtrarIndicaciones(this.registro.conceptId, id, fechaIngreso);
                } else {
                    this.indicaciones = Object.values(this.registro).reverse();
                    this.indicacionesCache = Object.values(this.registro);
                    this.tiposPrestacion = this.indicaciones.map(p => p.prestacion);
                    this.tipo = 'otras';
                }
            }
        } else {
            this.registro = indices[index];
            this.indicaciones = Object.values(registros[index]).reverse();

            if (this.registro.conceptId) {
                this.tipo = 'internacion';
                this.getPrestacion(this.registro.idPrestacion);
            } else {
                this.tipo = 'sinInternacion';
                this.indicacionesCache = Object.values(registros[index]);
                this.tiposPrestacion = this.indicaciones.map(p => p.concepto);
            }
        }
    }

    getPrestacion(id) {
        this.servicioPrestacion.getById(id).subscribe((prestacion) => {
            this.prestacion = prestacion;
        });
    }

    filtrarIndicaciones(conceptId, idInternacion, fecha) {
        this.planIndicacionesServices.getIndicaciones(idInternacion, fecha, 'medica', 'draft').subscribe((indicaciones) => {
            this.indicaciones = indicaciones.filter((indicacion) => indicacion.concepto.conceptId === conceptId).map((indicacion) => {
                const diasSuministro = moment().diff(moment(indicacion.fechaInicio), 'days');

                return { ...indicacion, diasSuministro };
            });
        });
    }

    getIndicaciones(id) {
        this.planIndicacionesServices.search({ prestacion: id }).subscribe((indicaciones) => {
            this.indicaciones = indicaciones;
        });
    }

    descargarInforme(prestacion) {
        this.requestInProgress = true;
        const term = prestacion.solicitud.tipoPrestacion.term;
        const informe = { idPrestacion: prestacion.id };

        this.servicioDocumentos.descargarInformeRUP(informe, term).subscribe({
            complete: () => this.requestInProgress = false,
            error: () => this.requestInProgress = false
        });
    }

    mostrar() {
        this.mostrarMas = !this.mostrarMas;
    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }

    filtrar() {
        let filtroIndicaciones = this.indicacionesCache.slice();

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
}
