import { Component, OnInit, ReflectiveInjector } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { FormulaBaseService, FormularRegister } from '../formulas/index';
import { RupElement } from '.';

@Component({
    selector: 'rup-formula-base',
    templateUrl: 'FormulaBase.html'
})
@RupElement('FormulaBaseComponent')
export class FormulaBaseComponent extends RUPComponent implements OnInit {
    public formulaProvider: FormulaBaseService;
    public resultado;

    ngOnInit() {
        const provider = ReflectiveInjector.resolveAndCreate(FormularRegister.list());
        if (this.elementoRUP.formulaImplementation) {
            const formulaName = this.elementoRUP.formulaImplementation;
            const formulaService = FormularRegister.get(formulaName);
            this.formulaProvider = provider.get(formulaService.service);
        } else {
            const formulaService = FormularRegister.get('FormulaBaseService');
            this.formulaProvider = provider.get(formulaService.service);
            this.formulaProvider.formula = this.params.formula;
        }
        this.emitChange(null);

    }

    emitChange(event) {
        this.resultado = this.formulaProvider.calcular(this.paciente, this.prestacion, this.registro.registros);
        this.registro.valor = this.resultado.value;
    }


}





