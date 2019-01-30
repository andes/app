import { Constantes } from './../controllers/constants';
import { LaboratorioContextoCacheService } from './../services/protocoloCache.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-laboratorio',
    templateUrl: 'laboratorio.html'
})
export class LaboratorioComponent implements OnInit {

    public mostrarPuntoInicio;

    public protocolo;
    public paciente;
    private contextoCache;

    constructor(public laboratorioContextoCacheService: LaboratorioContextoCacheService) { }

    ngOnInit() {
        this.contextoCache = this.laboratorioContextoCacheService.getContextoCache();
        this.mostrarPuntoInicio = this.laboratorioContextoCacheService.isModoRecepcionSinTurno();
    }

    seleccionarProtocolo($event) {
        this.mostrarPuntoInicio = false;
        this.protocolo = $event.protocolo;
    }

    recepcionarSinTurno($event) {
        this.laboratorioContextoCacheService.cambiarModo(Constantes.modos.recepcionSinTurno);
        this.contextoCache.edicionDatosCabecera = true;
        this.mostrarPuntoInicio = false;
        this.paciente = $event;
    }

    volverAPuntoInicio($event) {
        this.mostrarPuntoInicio = true;
    }
}
