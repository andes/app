import { Component } from '@angular/core';

@Component({
    selector: 'app-laboratorio',
    templateUrl: 'laboratorio.html'
})
export class LaboratorioComponent {

    // valor se debe asignar segun permuiso de usuario
    public modo = 'carga';
    // public modo = "puntoInicio";
    public mostrarPuntoInicio = (this.modo === 'puntoInicio');

    public protocolo;
    public paciente;

    seleccionarProtocolo($event) {
        this.mostrarPuntoInicio = false;
        this.protocolo = $event.protocolo;
    }

    recepcionarSinTurno($event) {
        this.mostrarPuntoInicio = false;
        this.paciente = $event;
    }

    volverAPuntoInicio($event) {
        this.mostrarPuntoInicio = true;
    }
}
