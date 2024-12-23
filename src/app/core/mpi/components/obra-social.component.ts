import { Component, Input } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';

@Component({
    selector: 'obra-social',
    templateUrl: 'obra-social.html'
})

export class ObraSocialComponent {
    @Input() paciente: IPaciente;

    public financiador;

    setFinanciador(financiador: any) {
        this.financiador = financiador;
    }
}
