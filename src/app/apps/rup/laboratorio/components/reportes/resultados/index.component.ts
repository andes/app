import { LaboratorioContextoCacheService } from './../../../services/protocoloCache.service';
import { Auth } from '@andes/auth';
import { ProtocoloService } from './../../../services/protocolo.service';
import { Plex } from '@andes/plex';
import { ActivatedRoute } from '@angular/router';
import { PacienteService } from './../../../../../../services/paciente.service';
import { Component, OnInit, Input, ViewChild, EventEmitter, Output, ViewEncapsulation, HostBinding } from '@angular/core';


@Component({
    selector: 'reporte-resultados-index',
    templateUrl: 'index.html',
    styleUrls: ['../../../assets/laboratorio.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class ReporteResultadosIndexComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    @Output() volverAPuntoInicioEmmiter: EventEmitter<any> = new EventEmitter<any>();
    public seleccionPaciente: Boolean = false;
    public showListarProtocolos: Boolean = true;
    public showProtocoloDetalle: Boolean = false;
    public showCargarSolicitud: Boolean = false;
    public showBotonGuardar: Boolean = false;
    public editarListaPracticas: Boolean = false;
    public showBotonAceptarCambiosAuditoria: Boolean = false;
    public showBotonAceptarCambiosHeader: Boolean = false;

    public titulo;
    public contextoCache;

    public areas = [];


    public busqueda;

    public protocolos: any[];
    public protocolo: any;
    routeParams: any;


    constructor(
        public servicePaciente: PacienteService,
        private route: ActivatedRoute,
        public plex: Plex,
        public protocoloService: ProtocoloService,
        public auth: Auth,
        public laboratorioContextoCacheService: LaboratorioContextoCacheService,
    ) { }

    ngOnInit() {  }

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
        this.areas = filtros.areas ? filtros.areas : [];
        // }

        this.busqueda.estado = this.laboratorioContextoCacheService.isModoValidacion() ? ['pendiente', 'ejecucion'] :  [];

        this.protocoloService.get(this.busqueda).subscribe(protocolos => {
            this.protocolos = protocolos;
        }, err => {
            if (err) {
                this.plex.info('danger', err);
            }
        });
    }
}
