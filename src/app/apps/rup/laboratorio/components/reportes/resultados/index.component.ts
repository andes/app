import { ReportesLaboratorioService } from './../../../services/reportes';
import { ProtocoloService } from './../../../services/protocolo.service';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../../../../../services/paciente.service';
import { Component, OnInit, EventEmitter, Output, ViewEncapsulation, HostBinding } from '@angular/core';
import { saveAs } from 'file-saver';
import { Slug } from 'ng2-slugify';

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
    public idsProtocolosSeleccionados;
    private slug = new Slug('default'); // para documento pdf

    constructor(
        public servicePaciente: PacienteService,
        public plex: Plex,
        public protocoloService: ProtocoloService,
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

        this.busqueda = filtros;
        this.busqueda.areas = filtros.areas && filtros.areas.length > 0 ? filtros.areas.map(e => { return e.id; }) : [];

        this.protocoloService.get(this.busqueda).subscribe(protocolos => {
            this.cargarArrayProtocolosSeleccionados(protocolos);
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
     * @private
     * @memberof ReporteResultadosIndexComponent
     */
    private cargarArrayProtocolosSeleccionados(protocolos) {
        this.idsProtocolosSeleccionados = {};
        protocolos.forEach(e => this.idsProtocolosSeleccionados[e._id] = false );
    }

    /**
     *
     *
     * @param {*} protocolos
     * @memberof ReporteResultadosIndexComponent
     */
    descargarReportes() {
        this.reportesLaboratorioService.reporteResultados(this.protocolos.filter(
            p => this.idsProtocolosSeleccionados[p._id] )
        ).subscribe(data => {
            if (data) {
                saveAs(
                    new Blob([data], { type: 'application/pdf' }),
                    this.slug.slugify(moment().format('DD-MM-YYYY-hmmss')) + '.pdf'
                );
            }
        });
    }
}
