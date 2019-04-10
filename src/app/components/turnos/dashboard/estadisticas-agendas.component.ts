import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

@Component({
    selector: 'estadisticas-agendas',
    templateUrl: 'estadisticas-agendas.html'
})

export class EstadisticasAgendasComponent implements OnInit {

    // Inicialización
    constructor(public plex: Plex, public auth: Auth) { }

    ngOnInit() {

    }


}
