import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
// import * as moment from 'moment';
import { OrganizacionService } from '../../services/organizacion.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { TipoPrestacionService } from '../../services/tipoPrestacion.service';

@Component({
    selector: 'encabezadoReportesDiarios',
    templateUrl: 'encabezadoReportesDiarios.html',

})
export class EncabezadoReportesDiariosComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    // Variables comunes a varios reportes
    // public disabled = true;
    public showBotonImprimir = false;
    public opcionesOrganizacion: any = [];
    public opcionesReportes: any = [];
    public opcionesPrestacion: any = [];
    public parametros = {};
    public organizacion;
    public tipoReportes;
    public prestacion;

    public reporte: any = [];

    // Variables "ResumenDiarioMensual"
    public showResumenDiarioMensual = false;
    public opcionesMes: any = [];
    public opcionesAnio: any = [];
    public anio;
    public mes;

    // Variables "PlanillaC1"
    public showPlanillaC1 = false;
    public fecha: any;

    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private router: Router,
        private server: Server,
        private agendaService: AgendaService,
        private auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        public servicioPrestacion: TipoPrestacionService
    ) {

    }

    public ngOnInit() {
        // debugger

        this.organizacion = null;
        this.tipoReportes = null;
        this.mes = null;
        this.anio = null;

        this.opcionesReportes = [
            {
                id: 1,
                nombre: 'ResumenDiarioMensual'
            },
            {
                id: 2,
                nombre: 'PlanillaC1'
            }];

        this.loadPrestaciones();

        this.opcionesMes = [
            {
                id: 1,
                nombre: 'Enero'
            },
            {
                id: 2,
                nombre: 'Febrero'
            },
            {
                id: 3,
                nombre: 'Marzo'
            },
            {
                id: 4,
                nombre: 'Abril'
            },
            {
                id: 5,
                nombre: 'Mayo'
            },
            {
                id: 6,
                nombre: 'Junio'
            },
            {
                id: 7,
                nombre: 'Julio'
            },
            {
                id: 8,
                nombre: 'Agosto'
            },
            {
                id: 9,
                nombre: 'Septiembre'
            },
            {
                id: 10,
                nombre: 'Octubre'
            },
            {
                id: 11,
                nombre: 'Noviembre'
            },
            {
                id: 12,
                nombre: 'Diciembre'
            }];

        this.opcionesAnio = [
            {
                id: 1,
                nombre: '2018'
            },
            {
                id: 2,
                nombre: '2019'
            },
            {
                id: 3,
                nombre: '2020'
            }];

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

    loadPrestaciones() {
        this.servicioPrestacion.get({
            turneable: 1
        }).subscribe((data) => {
            this.opcionesPrestacion = data;
        });
    }


    refreshSelection(value, tipo) {
        // tslint:disable-next-line:no-debugger
        // debugger;

        switch (tipo) {
            case 'organizacion': {
                if (value.value !== null) {
                    this.parametros['organizacion'] = this.organizacion.id;
                    this.parametros['organizacionNombre'] = this.organizacion.nombre;
                } else {
                    this.parametros['organizacion'] = '';
                    this.parametros['organizacionNombre'] = '';
                }
            } break;

            case 'tipoReportes': {
                if (value.value !== null) {
                    this.parametros['tipoReportes'] = this.tipoReportes.nombre;
                } else {
                    this.parametros['tipoReportes'] = '';
                }
            } break;

            case 'mes': {
                if (value.value !== null) {
                    this.parametros['mes'] = this.mes.id;
                    this.parametros['mesNombre'] = this.mes.nombre;
                } else {
                    this.parametros['mes'] = '';
                    this.parametros['mesNombre'] = '';
                }
            } break;

            case 'anio': {
                if (value.value !== null) {
                    this.parametros['anio'] = this.anio.nombre;
                } else {
                    this.parametros['anio'] = '';
                }
            } break;

            case 'prestacion': {
                if (value.value !== null) {
                    this.parametros['prestacion'] = this.prestacion.id;
                    this.parametros['prestacionNombre'] = this.prestacion.nombre;
                } else {
                    this.parametros['prestacion'] = '';
                    this.parametros['prestacionNombre'] = '';
                }
            } break;

            case 'fecha': {
                if (value.value !== null) {
                    this.parametros['fecha'] = this.fecha;
                } else {
                    this.parametros['fecha'] = '';
                }
            } break;

            default:
                break;
        }// End Switch

    }


    onChangeTipoReportes(event) {

        this.parametros = {};
        this.parametros['organizacion'] = this.organizacion.id;
        this.parametros['organizacionNombre'] = this.organizacion.nombre;
        if (this.tipoReportes !== null) {
            this.parametros['tipoReportes'] = this.tipoReportes.nombre;
        }

    }






    public generar() {


        if (this.parametros['organizacion'] && this.parametros['tipoReportes'] && this.parametros['mes'] && this.parametros['anio'] && this.parametros['tipoReportes'] === 'ResumenDiarioMensual') {

            this.agendaService.findResumenDiarioMensual(this.parametros).subscribe((reporte) => {

                this.reporte = reporte;
                this.showResumenDiarioMensual = true;
                this.showBotonImprimir = true;
            });
        }

        if (this.parametros['organizacion'] && this.parametros['tipoReportes'] && this.parametros['fecha'] && this.parametros['tipoReportes'] === 'PlanillaC1') {



            this.agendaService.findPlanillaC1(this.parametros).subscribe((reporte) => {
                this.reporte = reporte;
                this.showPlanillaC1 = true;
                this.showBotonImprimir = true;
            });
        }

    }



    public imprimir(cmpName) {
        const printContent = document.getElementById(cmpName);
        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');

        WindowPrt.document.write('<html><head><title>Reporte ' + cmpName + '</title>');
        WindowPrt.document.write('</head><body >');

        switch (cmpName) {
            case 'ResumenDiarioMensual':
                WindowPrt.document.write('<style>th,td{text-align: center; padding: 0.2rem; width: 25px;} thead,tfoot{background-color: gray;} table, th, td {border: 1px solid black; } table {width: 100%;border-collapse: collapse;} th {height: 25px;}</style>');
                break;

            case 'PlanillaC1':
                WindowPrt.document.write('<style>@media print{@page {size: landscape}} th,td{text-align: center; padding: 0.2rem; width: 25px;} thead,tfoot{background-color: gray;} table, th, td {border: 1px solid black; } table {width: 100%;border-collapse: collapse; font-size: 12px;} th {height: 25px;}</style>');
                break;

            default:
                break;
        }




        WindowPrt.document.write(printContent.innerHTML);
        WindowPrt.document.write('</body></html>');

        WindowPrt.document.close();
        WindowPrt.focus();
        WindowPrt.print();
        WindowPrt.close();
    }




}

