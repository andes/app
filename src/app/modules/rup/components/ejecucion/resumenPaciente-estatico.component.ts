import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, Output, Input, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPaciente } from '../../../../interfaces/IPaciente';

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

    constructor(private plex: Plex) {

    }

    ngOnInit() {
        this.prestacionSolicitud = this.prestacion.solicitud;
        this.plex.updateTitle([{
            route: '/rup',
            name: 'RUP'
        }, {
            name: this.prestacionSolicitud && this.prestacionSolicitud.tipoPrestacion.term ? this.prestacionSolicitud.tipoPrestacion.term : ''
        }]);
    }
}
