import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import * as moment from 'moment';
import { OrganizacionService } from '../../services/organizacion.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { QueriesService } from '../../services/query.service';
import { Slug } from 'ng2-slugify';


@Component({
    selector: 'encabezadoReportes',
    templateUrl: 'encabezadoReportes.html',

})
export class EncabezadoReportesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente


    // Propiedades diagnostico
    public showConsultaDiagnostico = false;
    public showReporteC2 = false;
    public showCantidadConsultaXPrestacion = false;
    public showCovid19 = false;
    public showSeguimientoCovid = false;
    public enableCsv = false;
    public opciones: any = [];
    public parametros;
    public horaInicio: any;
    public horaFin: any;
    public organizacion;
    public tipoReportes;
    public diagnosticos = [];
    public casos = [];
    // Propiedades reporteC2
    public totalConsultas = 0;
    public totalMenor1 = 0;
    public total1 = 0;
    public total24 = 0;
    public total59 = 0;
    public total1014 = 0;
    public total1524 = 0;
    public total2534 = 0;
    public total3544 = 0;
    public total4564 = 0;
    public totalMayor65 = 0;
    public totalMasculino = 0;
    public totalFemenino = 0;
    public totalOtro = 0;
    private slug: Slug = new Slug('default');
    public queries;

    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private router: Router,
        private server: Server,
        private agendaService: AgendaService,
        private auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private queryService: QueriesService

    ) {

    }

    public ngOnInit() {
        if (!this.auth.check('reportes')) {
            this.router.navigate(['./inicio']);
        }
        this.parametros = {
            horaInicio: this.horaInicio,
            horaFin: this.horaFin,
            organizacion: this.auth.organizacion.id
        };
        this.organizacion = this.auth.organizacion.nombre;
        this.queryService.getAllQueries({ desdeAndes: true }).subscribe((query) => {
            this.opciones = [{
                id: 1,
                nombre: 'Reporte C2'
            },
            {
                id: 2,
                nombre: 'Diagnósticos'
            },
            {
                id: 3,
                nombre: 'Consultas por prestación'
            },
            ];
            this.queries = query;
            let i = 4;
            this.queries.forEach(element => {
                this.opciones.push({ id: i, nombre: element.nombre });
                i++;
            });
        });
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }


    }

    refreshSelection(value, tipo) {
        if (tipo === 'horaInicio') {
            let horaInicio = moment(this.horaInicio).startOf('day');
            if (horaInicio.isValid()) {
                this.parametros['horaInicio'] = horaInicio.isValid() ? horaInicio.toDate() : moment().format();
            }
        }
        if (tipo === 'horaFin') {
            let horaFin = moment(this.horaFin).endOf('day');
            if (horaFin.isValid()) {
                this.parametros['horaFin'] = horaFin.isValid() ? horaFin.toDate() : moment().format();
            }
        }
        if (tipo === 'organizacion') {
            if (value.value !== null) {
                this.parametros['organizacion'] = this.auth.organizacion.id;
            } else {
                this.parametros['organizacion'] = '';
            }
        }
    }


    public imprimir() {
        switch (this.tipoReportes.nombre) {
            case 'Diagnósticos':
                this.showConsultaDiagnostico = true;
                this.showReporteC2 = false;
                this.showCantidadConsultaXPrestacion = false;
                this.showSeguimientoCovid = false;
                this.agendaService.findConsultaDiagnosticos(this.parametros).subscribe((diagnosticos) => {
                    this.diagnosticos = diagnosticos;
                });
                break;
            case 'Reporte C2':
                this.showReporteC2 = true;
                this.showConsultaDiagnostico = false;
                this.showCantidadConsultaXPrestacion = false;
                this.showSeguimientoCovid = false;
                this.agendaService.findDiagnosticos(this.parametros).subscribe((diagnosticos) => {
                    this.diagnosticos = diagnosticos;
                    this.totalConsultas = this.diagnosticos.map(elem => { return elem.total; }).reduce(this.add, 0);
                    this.totalMenor1 = this.diagnosticos.map(elem => { return elem.sumaMenor1; }).reduce(this.add, 0);
                    this.total1 = this.diagnosticos.map(elem => { return elem.suma1; }).reduce(this.add, 0);
                    this.total24 = this.diagnosticos.map(elem => { return elem.suma24; }).reduce(this.add, 0);
                    this.total59 = this.diagnosticos.map(elem => { return elem.suma59; }).reduce(this.add, 0);
                    this.total1014 = this.diagnosticos.map(elem => { return elem.suma1014; }).reduce(this.add, 0);
                    this.total1524 = this.diagnosticos.map(elem => { return elem.suma1524; }).reduce(this.add, 0);
                    this.total2534 = this.diagnosticos.map(elem => { return elem.suma2534; }).reduce(this.add, 0);
                    this.total3544 = this.diagnosticos.map(elem => { return elem.suma3544; }).reduce(this.add, 0);
                    this.total4564 = this.diagnosticos.map(elem => { return elem.suma4564; }).reduce(this.add, 0);
                    this.totalMayor65 = this.diagnosticos.map(elem => { return elem.sumaMayor65; }).reduce(this.add, 0);
                    this.totalMasculino = this.diagnosticos.map(elem => { return elem.sumaMasculino; }).reduce(this.add, 0);
                    this.totalFemenino = this.diagnosticos.map(elem => { return elem.sumaFemenino; }).reduce(this.add, 0);
                    this.totalOtro = this.diagnosticos.map(elem => { return elem.sumaOtro; }).reduce(this.add, 0);
                });
                break;
            case 'Consultas por prestación':
                this.showCantidadConsultaXPrestacion = true;
                this.showConsultaDiagnostico = false;
                this.showReporteC2 = false;
                this.showSeguimientoCovid = false;
                this.agendaService.findCantidadConsultaXPrestacion(this.parametros).subscribe((diagnosticos) => {
                    this.diagnosticos = diagnosticos;
                });
                break;
            default:
                let resultado = this.queries.find(query => query.nombre === this.tipoReportes.nombre);
                if (resultado) {
                    this.showCantidadConsultaXPrestacion = false;
                    this.showConsultaDiagnostico = false;
                    this.showReporteC2 = false;
                    this.showSeguimientoCovid = true;
                    let params = {
                        fechaDesde: this.parametros['horaInicio'],
                        fechaHasta: this.parametros['horaFin'],
                        organizacion: this.parametros['organizacion']
                    };
                    this.queryService.getQuery(this.tipoReportes.nombre, params).subscribe((casos) => {
                        if (casos.length) {
                            this.casos = casos;
                        } else {
                            this.plex.info('warning', 'Su búsqueda no arrojó ningún resultado');
                        }
                    });
                }
                break;
        }
    }

    descargarCsv() {
        let params = {
            fechaDesde: this.parametros['horaInicio'],
            fechaHasta: this.parametros['horaFin'],
            organizacion: this.parametros['organizacion']
        };
        this.queryService.descargarCsv(this.tipoReportes.nombre, params).subscribe();
    }

    selectChange(event) {
        if (event.value) {
            let resultado = this.queries.find(query => query.nombre === this.tipoReportes.nombre);
            if (resultado) {
                this.enableCsv = true;
            } else {
                this.enableCsv = false;
            }
        } else {
            this.enableCsv = false;
        }
    }

    add(a, b) {
        return a + b;
    }







}

