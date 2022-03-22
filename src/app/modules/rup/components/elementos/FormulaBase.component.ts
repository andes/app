import { Component, OnInit, ReflectiveInjector } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { FormulaBaseService, FormularRegister } from '../formulas/index';
import { RupElement } from '.';
import { ISnomedConcept } from '../../interfaces/snomed-concept.interface';

@Component({
    selector: 'rup-formula-base',
    templateUrl: 'FormulaBase.html'
})
@RupElement('FormulaBaseComponent')
export class FormulaBaseComponent extends RUPComponent implements OnInit {
    public formulaProvider: FormulaBaseService;
    public resultado;
    public hasRules = false;
    public habilitado = false;
    public valorManual: Boolean = false;

    ngOnInit() {
        this.valorManual = this.registro.valorManual;
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
        this.hasRules = this.elementoRUP.rules?.length > 0;
        this.emitChange2();

        this.addFact('value', this.registro.valor);

        this.onRule('alert').subscribe(evento => {
            const { params } = evento;
            this.mensaje = {
                texto: params.message,
                type: params.type,
                add: params.add
            };
        });
    }

    addConcepto(concepto: ISnomedConcept) {
        this.ejecucionService.agregarConcepto(
            concepto
        );
    }

    emitChange2() {
        if (!this.valorManual) {
            this.resultado = this.formulaProvider.calcular(this.paciente, this.prestacion, this.registro.registros);
            this.registro.valor = this.resultado.value;
        }
        this.onChange();
    }

    onChange() {
        this.emitChange();
        this.mensaje = {};
        this.addFact('value', this.registro.valor);
    }

    changeValorManual(valor) {
        this.valorManual = valor;
        if (this.valorManual) {
            this.registro.valorManual = true;
            this.registro.registros.map(reg => reg.valor = null);
        } else {
            delete this.registro.valorManual;
            this.registro.valor = 0;
        }
    }
}





