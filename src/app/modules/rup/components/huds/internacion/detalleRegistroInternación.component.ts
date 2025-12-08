
import { Auth } from '@andes/auth';
import { Component, Input, OnInit } from '@angular/core';
import { PlanIndicacionesServices } from 'src/app/apps/rup/mapa-camas/services/plan-indicaciones.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { DocumentosService } from 'src/app/services/documentos.service';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { InformeEstadisticaService } from '../../../services/informe-estadistica.service';
import { IInformeEstadistica } from '../../../interfaces/informe-estadistica.interface';

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
    public requestInProgress = false;
    public puedeDescargarInforme = false;
    public mostrarMas = false;
    public colapsable = [];
    public paginacion = [];
    public maxSizePaginas = [10, 20, 30];
    public sizePagina = 30;
    public selectorSizePagina = 30;
    public pagina = 1;
    public paginaInvalida = false;
    public collapse = false;

    // Para internaciones estadísticas
    public informeEstadistico: IInformeEstadistica;
    public loadingInforme = false;

    constructor(
        public servicioPrestacion: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        private planIndicacionesServices: PlanIndicacionesServices,
        private servicioDocumentos: DocumentosService,
        private auth: Auth,
        private informeEstadisticaService: InformeEstadisticaService
    ) { }

    ngOnInit() {

        // HUDSService envuelve el objeto en data, así que puede estar en data.data
        const internacionData = this.internacion.data.data || this.internacion.data;
        const { id, index, registros, fechaIngreso, esInformeEstadistico, prestaciones } = internacionData;



        this.puedeDescargarInforme = this.auth.check('huds:impresion');

        // Si es una internación estadística, cargar el informe PRIMERO
        if (esInformeEstadistico) {
            this.cargarInformeEstadistico(id, () => {
                // Cargar registros DESPUÉS de que el informe se haya cargado
                this.cargarRegistros(id, registros, index, fechaIngreso, prestaciones);
            });
        } else {
            this.cargarRegistros(id, registros, index, fechaIngreso, null);
        }
    }

    cargarInformeEstadistico(id: string, callback?: () => void) {
        this.loadingInforme = true;
        this.informeEstadisticaService.getById(id).subscribe(
            (informe: IInformeEstadistica) => {
                this.informeEstadistico = informe;
                this.loadingInforme = false;
                if (callback) {
                    callback();
                }
            },
            (error) => {
                this.loadingInforme = false;
            }
        );
    }

    esPlanIndicacion(registro) {
        return registro.conceptId && ['33633005', '430147008'].includes(registro.conceptId);
    }

    cargarRegistros(idInternacion, registros, index, fechaIngreso, prestaciones = null) {

        this.registro = registros[index];

        if (this.esPlanIndicacion(this.registro)) {
            this.tipo = 'planIndicaciones';
            this.getIndicaciones(this.registro.conceptId, idInternacion, fechaIngreso);
            this.getPrestacion(this.registro.idPrestacion);
        } else {
            // Si es un informe estadístico, usar las prestaciones que vienen de hudsBusqueda
            if (this.informeEstadistico && prestaciones) {

                // Crear el objeto de prestación para el informe estadístico
                const informePrestacion = {
                    prestacion: {
                        term: 'INTERNACIÓN'
                    },
                    data: {
                        estadoActual: {
                            createdAt: this.informeEstadistico.informeEgreso?.fechaEgreso || this.informeEstadistico.informeIngreso?.fechaIngreso,
                            createdBy: { nombreCompleto: 'Sistema' }
                        }
                    },
                    esInformeEstadistico: true,
                    informe: this.informeEstadistico
                };


                // Mapear prestaciones al formato esperado
                const prestacionesMapeadas = prestaciones.map((p, idx) => {
                    const mapped = {
                        prestacion: p.solicitud?.tipoPrestacion || { term: 'Sin tipo' },
                        data: p,
                        esInformeEstadistico: false
                    };
                    return mapped;
                });



                // Agregar el informe al inicio + las prestaciones médicas
                this.registro = [informePrestacion, ...prestacionesMapeadas];

                this.tipo = 'registrosInternacion';

                this.actualizarPaginacion();
            } else {


                // Prestaciones normales
                this.registro = Object.values(this.registro);

                if (idInternacion) {
                    this.tipo = 'registrosInternacion';
                } else {
                    this.tipo = 'fueraDeInternacion';
                }

                this.actualizarPaginacion();
            }
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

    descargarInforme(prestacion) {
        this.requestInProgress = true;
        const term = prestacion.solicitud.tipoPrestacion.term;
        const informe = { idPrestacion: prestacion.id };

        this.servicioDocumentos.descargarInformeRUP(informe, term).subscribe({
            complete: () => this.requestInProgress = false,
            error: () => this.requestInProgress = false
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

    setNumeroPagina(page: any) {
        const totalPaginas = this.totalPaginas();
        const numero = Number(page);

        if (isNaN(numero) || page === null || numero === 0) {
            this.pagina = 1;
            return;
        }

        if (!page || page < 1 || page > totalPaginas) {
            this.paginaInvalida = true;
            return;
        }

        this.paginaInvalida = false;
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


