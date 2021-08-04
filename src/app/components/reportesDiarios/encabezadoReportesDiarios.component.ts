import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { OrganizacionService } from '../../services/organizacion.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { getObjMeses } from '../../../app/utils/enumerados';
import { ProfesionalService } from '../../services/profesional.service';
import { ExcelService } from '../../services/xlsx.service';

@Component({
    selector: 'encabezadoReportesDiarios',
    templateUrl: 'encabezadoReportesDiarios.html',

})
export class EncabezadoReportesDiariosComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    // Variables comunes a varios reportes
    public showBotonExportaXLS = false;
    public showBotonImprimir = false;
    public opcionesOrganizacion: any = [];
    public opcionesReportes: { id: number; nombre: string }[] = [];
    public parametros = {};
    public organizacion;
    public tipoReportes;
    public prestacion;

    public reporte: any = [];

    // Variables "ResumenDiarioMensual"
    public showResumenDiarioMensual = false;
    public opcionesMes: { id: number; nombre: string }[] = [];
    public opcionesAnio: { id: number; nombre: string }[] = [];
    public anio;
    public mes;
    public divirTurnos = false;

    // Variables "PlanillaC1"
    public showPlanillaC1 = false;
    public fecha: any;
    public profesional: any;

    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private agendaService: AgendaService,
        private profesionalService: ProfesionalService,
        private excelService: ExcelService
    ) {

    }

    public ngOnInit() {
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            name: 'Reportes diarios'
        }]);

        this.organizacion = null;
        this.tipoReportes = null;
        this.mes = null;
        this.anio = null;
        this.opcionesReportes = this.getObjTiposReportes();
        this.opcionesMes = getObjMeses();
        this.opcionesAnio = this.getObjAnios();
    }

    getObjTiposReportes() {
        let tiposReportes = [
            {
                id: 1,
                nombre: 'Resumen diario mensual'
            },
            {
                id: 2,
                nombre: 'Planilla C1'
            }];
        return tiposReportes;
    }

    getObjAnios() {
        let anios = [
            {
                id: 1,
                nombre: moment().subtract(2, 'years').format('YYYY')
            },
            {
                id: 2,
                nombre: moment().subtract(1, 'years').format('YYYY')
            },
            {
                id: 3,
                nombre: moment().format('YYYY')
            }
        ];
        return anios;
    }

    loadProfesionales(event) {
        if (this.profesional) {
            event.callback(this.profesional);
        }
        if (event.query && event.query.length > 2) {
            const query = {
                nombreCompleto: event.query
            };
            this.profesionalService.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            event.callback([]);
        }
    }

    refreshSelection() {
        this.showPlanillaC1 = false;
        this.showResumenDiarioMensual = false;
        this.showBotonImprimir = false;
        this.showBotonExportaXLS = false;
    }


    onChangeTipoReportes(event) {
        this.parametros = {};
        this.parametros['organizacion'] = this.organizacion.id;
        this.parametros['organizacionNombre'] = this.organizacion.nombre;
        if (this.tipoReportes !== null) {
            this.parametros['tipoReportes'] = this.tipoReportes.nombre;
        }
    }


    getParams() {
        // organizacion
        if (this.organizacion) {
            this.parametros['organizacion'] = this.organizacion.id;
            this.parametros['organizacionNombre'] = this.organizacion.nombre;
        } else {
            this.parametros['organizacion'] = '';
            this.parametros['organizacionNombre'] = '';
        }

        // tipoReportes
        if (this.tipoReportes) {
            this.parametros['tipoReportes'] = this.tipoReportes.nombre;
        } else {
            this.parametros['tipoReportes'] = '';
        }

        // mes
        if (this.mes) {
            this.parametros['mes'] = this.mes.id;
            this.parametros['mesNombre'] = this.mes.nombre;
        } else {
            this.parametros['mes'] = '';
            this.parametros['mesNombre'] = '';
        }

        // anio
        if (this.anio) {
            this.parametros['anio'] = this.anio.nombre;
        } else {
            this.parametros['anio'] = '';
        }

        // prestacion
        if (this.prestacion) {
            this.parametros['prestacion'] = this.prestacion.conceptId;
            this.parametros['prestacionNombre'] = this.prestacion.nombre;
        } else {
            this.parametros['prestacion'] = '';
            this.parametros['prestacionNombre'] = '';
        }

        // fecha
        if (this.fecha) {
            this.parametros['fecha'] = this.fecha;
        } else {
            this.parametros['fecha'] = '';
        }

        // Dividir turno
        this.parametros['dividir'] = this.divirTurnos;

        // Profesional
        if (this.profesional) {
            this.parametros['profesional'] = this.profesional.id;
        } else {
            this.parametros['profesional'] = '';
        }
    }

    public generar() {
        this.getParams();

        if (this.parametros['prestacion'] && this.parametros['organizacion'] && this.parametros['tipoReportes'] && this.parametros['mes'] && this.parametros['anio'] && this.parametros['tipoReportes'] === 'Resumen diario mensual') {

            this.agendaService.findResumenDiarioMensual(this.parametros).subscribe((reporte) => {

                this.reporte = reporte;
                this.showPlanillaC1 = false;
                this.showResumenDiarioMensual = true;
                this.showBotonImprimir = true;
                this.showBotonExportaXLS = true;
            });
        }

        if (this.parametros['prestacion'] && this.parametros['organizacion'] && this.parametros['tipoReportes'] && this.parametros['fecha'] && this.parametros['tipoReportes'] === 'Planilla C1') {

            this.agendaService.findPlanillaC1(this.parametros).subscribe((reporte) => {
                this.reporte = reporte;
                this.showResumenDiarioMensual = false;
                this.showPlanillaC1 = true;
                this.showBotonExportaXLS = this.showBotonImprimir = reporte && reporte.length > 0;
            });
        }
    }

    public imprimir(cmpName) {
        const printContent = document.getElementById(cmpName);
        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');

        WindowPrt.document.write('<html><head><title>Reporte ' + cmpName + '</title>');
        WindowPrt.document.write('</head><body >');

        switch (cmpName) {
            case 'Resumen diario mensual':
                WindowPrt.document.write('<style>th,td{text-align: center; padding: 0.2rem; width: 25px;} thead,tfoot{background-color: gray;} table, th, td {border: 1px solid black; } table {width: 100%;border-collapse: collapse;} th {height: 25px;}</style>');
                break;

            case 'Planilla C1':
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

    public toExcel() {
        let data: Array<{ title: string; table: any }>;

        if (this.showResumenDiarioMensual) {
            data = this.reporte.map(item => {
                return {
                    title: item.tag,
                    table: document.getElementById(`${this.parametros['tipoReportes']} ${item.tag}`),
                };
            });
            this.excelService.exportMultipleTablesAsExcelFile(data, `reportesDiarios_${this.prestacion.nombre}_${this.mes.nombre}_${this.anio.nombre}`);
        } else {
            const date = new Date(this.fecha);
            const dateStr = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
            this.excelService.exportMultipleTablesAsExcelFile([{
                title: this.parametros['tipoReportes'],
                table: document.getElementById(this.parametros['tipoReportes']),
            }],
            `reportesDiarios_${this.prestacion.nombre}_${dateStr}`);
        }
    }

}
