import { Constantes } from './../controllers/constants';
import { ProtocoloCacheService } from './../services/protocoloCache.service';
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

    constructor(public protocoloCacheService: ProtocoloCacheService) { }

    ngOnInit() {
        this.contextoCache = this.protocoloCacheService.getContextoCache();
        this.mostrarPuntoInicio = this.contextoCache.modo === Constantes.modoIds.recepcionSinTurno;
    }

    seleccionarProtocolo($event) {
        this.mostrarPuntoInicio = false;
        this.protocolo = $event.protocolo;
    }

    recepcionarSinTurno($event) {
        this.protocoloCacheService.cambiarModo(Constantes.modoIds.recepcionSinTurno);
        this.contextoCache.edicionDatosCabecera = true;
        this.mostrarPuntoInicio = false;
        this.paciente = $event;
    }

    volverAPuntoInicio($event) {
        this.mostrarPuntoInicio = true;
    }
}
