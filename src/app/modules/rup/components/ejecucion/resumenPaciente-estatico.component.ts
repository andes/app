import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, Output, Input, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Plex } from '@andes/plex';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from '../../interfaces/snomed-concept.interface';

@Component({
    selector: 'rup-resumenPaciente-estatico',
    templateUrl: 'resumenPaciente-estatico.html'
})

export class ResumenPacienteEstaticoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    @Input() prestacion: IPrestacion;
    @Input() paciente: IPaciente;

    public prestacionSolicitud;

    public obraSocialPaciente;

    public conceptos: ISnomedConcept[] = [
        {
            conceptId: '307818003',
            fsn: 'seguimiento del peso (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            term: 'seguimiento del peso'
        },
        {
            conceptId: '710996002',
            fsn: 'monitorización de la talla (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            term: 'monitorización de la talla'
        },
        {
            fsn: 'control de la tensión sanguínea (régimen/tratamiento)',
            semanticTag: 'régimen/tratamiento',
            conceptId: '135840009',
            term: 'monitoreo de la tensión sanguínea'
        }
    ];

    public elementoRUP: IElementoRUP;
    public graficos: any[] = [];

    constructor(
        private plex: Plex,
        public elementosRUPService: ElementosRUPService,
        public servicioPrestacion: PrestacionesService) {

    }

    async ngOnInit() {
        this.prestacionSolicitud = this.prestacion.solicitud;
        this.plex.updateTitle([{
            route: '/rup',
            name: 'RUP'
        }, {
            name: this.prestacionSolicitud && this.prestacionSolicitud.tipoPrestacion.term ? this.prestacionSolicitud.tipoPrestacion.term : ''
        }]);

        for (let concepto of this.conceptos) {
            this.graficos.push(this.elementosRUPService.buscarElemento(concepto, false));
        }
    }
}
