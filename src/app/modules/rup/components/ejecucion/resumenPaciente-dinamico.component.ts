import { PrestacionesService } from '../../services/prestaciones.service';
import { Component, Output, Input, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPaciente } from '../../../../interfaces/IPaciente';

@Component({
    selector: 'rup-resumenPaciente-dinamico',
    templateUrl: 'resumenPaciente-dinamico.html'
})

export class ResumenPacienteDinamicoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    @Input() paciente: IPaciente;

    constructor(private servicioPrestacionPaciente: PrestacionesService,
        private router: Router, private route: ActivatedRoute,
        public auth: Auth, private plex: Plex) { }

    ngOnInit() {

    }
}
