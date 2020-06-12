import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-calculo-boston',
    templateUrl: 'calculoDeBoston.html'
})
@RupElement('CalculoDeBostonComponent')
export class CalculoDeBostonComponent extends RUPComponent implements OnInit {

    public valorBoston;
    public evaluacionResultado = '';
    public opciones = [
        { id: 0, label: '0' },
        { id: 1, label: '1' },
        { id: 2, label: '2' },
        { id: 3, label: '3' }];

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                ci: null,
                ct: null,
                cd: null
            };
        } else {
            this.changeNumber();
        }
    }

    isEmpty() {
        const valor = this.registro.valor;
        return !valor.ci && !valor.ct && !valor.cd;
    }

    changeNumber() {
        this.registro.valor.total = this.registro.valor.ci + this.registro.valor.ct + this.registro.valor.cd;
        this.valorBoston = `${this.registro.valor.total} / 9`;

        if (this.registro.valor.ci && this.registro.valor.ct && this.registro.valor.cd) {
            if (this.registro.valor.total > 6 && this.registro.valor.ci > 1 && this.registro.valor.ct > 1 && this.registro.valor.cd > 1) {
                this.evaluacionResultado = 'Adecuado';
            } else {
                this.evaluacionResultado = 'No adecuado';
            }
            this.registro.valor.resultado = this.evaluacionResultado;
        }
    }
}
