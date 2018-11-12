import { Component } from '@angular/core';

@Component({
    selector: 'app-laboratorio',
    templateUrl: 'laboratorio.html'
})
export class LaboratorioComponent {
    public mostrarPuntoInicio = true;
    public protocolo = {}; 

    seleccionarProtocolo($event) {
        console.log('principal seleccionarProtocolo', $event)
        this.mostrarPuntoInicio = false;
        this.protocolo = $event;
    }
}
