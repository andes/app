import { ReportesLaboratorioService } from './../../../services/reportes';
import { LaboratorioContextoCacheService } from './../../../services/protocoloCache.service';
import { ProtocoloService } from './../../../services/protocolo.service';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../../../../../services/paciente.service';
// import { descargarReportesResultados } from './../../../controllers/reportes';
import { Component, OnInit, EventEmitter, Output, ViewEncapsulation, HostBinding } from '@angular/core';


@Component({
    selector: 'reporte-resultados-index',
    templateUrl: 'index.html',
    styleUrls: ['../../../assets/laboratorio.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class ReporteResultadosIndexComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    @Output() volverAPuntoInicioEmmiter: EventEmitter<any> = new EventEmitter<any>();

    public areas = [];
    public busqueda;
    public protocolos: any[];
    public showBotonDescargar = true;

    constructor(
        public servicePaciente: PacienteService,
        public plex: Plex,
        public protocoloService: ProtocoloService,
        public laboratorioContextoCacheService: LaboratorioContextoCacheService,
        public reportesLaboratorioService: ReportesLaboratorioService
    ) { }

    ngOnInit() { }

    /**
     * Realiza la búsqueda de prestaciones según selección de filtros
     *
     * @param {any} [value]
     * @param {any} [tipo]
     * @memberof PuntoInicioLaboratorioComponent
     */
    refreshSelection(filtros) {
        if (!filtros) {
            this.protocolos.length = 0;
            return;
        }
        // if ($event) {
        this.busqueda = filtros;
        this.busqueda.areas = filtros.areas && filtros.areas.length > 0 ? filtros.areas.map(e => { return e.id; }) : [];
        // }

        this.busqueda.estado = this.laboratorioContextoCacheService.isModoValidacion() ? ['pendiente', 'ejecucion'] : [];

        this.protocoloService.get(this.busqueda).subscribe(protocolos => {
            this.protocolos = protocolos;
        }, err => {
            if (err) {
                this.plex.info('danger', err);
            }
        });
    }


    /**
     *
     *
     * @param {*} protocolos
     * @memberof ReporteResultadosIndexComponent
     */
    descargarReportes() {
        this.reportesLaboratorioService.reporteResultados(this.protocolos).subscribe( res => {
            console.log(res);
        });
    }
}
