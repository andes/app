import { PrestacionesService } from '../../../services/prestaciones.service';
import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPrestacion } from '../../../interfaces/prestacion.interface';
import { IPaciente } from '../../../../../interfaces/IPaciente';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { IElementoRUP } from '../../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';

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
    }
}
