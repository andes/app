interface IFormula {
    name: string;
    service: any;
}

import { Injectable, DebugElement } from '@angular/core';



const formulas: IFormula[] = [];

const get = (name) => {
    return formulas.find(item => item.name === name);
};

const register = (name, service) => {
    formulas.push({
        name, service
    });
};

const list = () => {
    return formulas.map(i => i.service);
};

export const FormularRegister = { get, register, list };



@Injectable()
export class FormulaBaseService {
    private _formula;

    get formula() {
        return this._formula;
    }

    set formula(value) {
        this._formula = value;
    }

    /**
     *
     * $0.valor + $1.valor * paciente.edad
     *
     * @param paciente
     * @param prestacion
     * @param registros
     */
    public calcular(paciente, prestacion, registros) {
        let __CONTEXT_FUNCTION__;
        if (registros.filter(r => r.valor === null || r.valor === undefined).length === 0) {
            const $ = registros.map(r => r.valor);
            const str = `__CONTEXT_FUNCTION__ = function ($, paciente, prestacion) { return ${this.formula};  }`;
            // tslint:disable-next-line:no-eval
            eval(str);
            const value = __CONTEXT_FUNCTION__.bind(null)($, paciente, prestacion);
            return {
                value,
                message: value
            };
        } else {
            return {
                value: 0,
                message: 0
            };
        }
    }
}
register('FormulaBaseService', FormulaBaseService);
