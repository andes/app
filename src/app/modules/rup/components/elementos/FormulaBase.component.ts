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
    public valorEditable; // Indica si se puede editar el resultado de la formula manualmente
    public habilitado = false;
    public valorManual: Boolean = false; // Indica si el usuario efectivamente editó manualmente el resultado

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
        this.valorEditable = this.elementoRUP.params?.valorEditable;

        this.addFact('value', this.registro.valor);

        this.onRule('alert').subscribe(evento => {
            const { params } = evento;
            this.mensaje = {
                texto: params.message,
                type: params.type,
                add: params.add
            };
        });

        if (!this.soloValores && this.params?.buscarAnterior && !this.registro.valor) {
            // Busca la última consulta en la huds del paciente y pre-carga los valores
            this.prestacionesService.getRegistrosHuds(this.paciente.id, this.registro.concepto.conceptId).subscribe(consultas => {
                if (consultas.length) {
                    const fechaPrestacion = moment(this.prestacion.updatedAt || this.prestacion.createdAt);
                    // filtramos por consultas menores a 9 meses
                    if (consultas.length !== 1) {
                        consultas = consultas.filter(c => moment(c.fecha).add(9, 'month').diff(fechaPrestacion) > 0 && c.registro.valor && !c.registro.valorManual)
                            .sort((a, b) => {
                                return moment(b.fecha).diff(moment(a.fecha));
                            });
                    }
                    const ultimaConsulta = consultas[0]?.registro;
                    const esFutura = moment(ultimaConsulta?.updatedAt).diff(fechaPrestacion) > 0;

                    if (!esFutura) {
                        this.registro.registros.map(reg => {
                            reg.valor = ultimaConsulta.registros.find(r => r.concepto.conceptId === reg.concepto.conceptId).valor;
                        });
                        this.emitChange2();
                        return;
                    }
                }
                this.emitChange2();
            });
        }
    }

    addConcepto(concepto: ISnomedConcept) {
        this.ejecucionService.agregarConcepto(
            concepto
        );
    }

    emitChange2() {
        if (!this.valorManual) {
            const conceptosRequeridos = this.elementoRUP.requeridos.map(elem => elem.concepto.conceptId);
            // si todos los campos requeridos estan completos, entonces realiza el cálculo
            if (conceptosRequeridos.every(requerido => this.registro.registros.find(reg => reg.concepto.conceptId === requerido && reg.valor))) {
                this.resultado = this.formulaProvider.calcular(this.paciente, this.prestacion, this.registro.registros);
                this.registro.valor = this.resultado.value;
            } else {
                this.registro.valor = null;
            }
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
            this.registro.valor = null;
        }
    }
}





