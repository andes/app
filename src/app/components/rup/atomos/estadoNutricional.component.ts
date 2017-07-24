import { Atomo } from './../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-estadoNutricional',
    templateUrl: 'estadoNutricional.html'
})

export class EstadoNutricionalComponent extends Atomo {
    suffix: String;
    ngOnInit() {
        if (this.paciente.edad >= 2) {
            this.suffix = 'IMC';
        } else {
            this.suffix = 'PRC';
        };
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : null;
        if (this.datosIngreso) {
            this.devolverValores();
        }
    }
    getMensajes() {
        let edad;
        edad = this.paciente.edad;
        let prc;
        prc = this.data[this.elementoRUP.key];
        let mensaje: any = {
            texto: null,
            class: 'danger'
        };
        if (edad >= 2) {

            switch (true) {
                case (prc > 97):
                    mensaje.texto = 'O (Obesidad)';
                    break;
                case (prc > 85 && prc <= 97):
                    mensaje.texto = 'Sp (Sobrepeso)';
                    break;
                case (prc >= 15 && prc < 85):
                    mensaje.texto = 'N (Normal)';
                    break;
                case (prc >= 3 && prc < 15):
                    mensaje.texto = 'RN (Riesgo Nutricional)';
                    break;
                case (prc < 3):
                    mensaje.texto = 'Em (Emaciación)';
                    break;
                default:
                    break;
            }
        }
        return mensaje;
    }
}

