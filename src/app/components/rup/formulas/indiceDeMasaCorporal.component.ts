import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import {
    Formula
} from './../core/formula.component';
import {
    Component,
    OnInit
} from '@angular/core';
import {
    ObservarDatosService
} from '../../../services/rup/observarDatos.service';

@Component({
    selector: 'rup-indice-de-masa-corporal',
    templateUrl: 'indiceDeMasaCorporal.html'
})
export class IndiceDeMasaCorporalComponent extends Formula implements OnInit {

    ngOnInit() {
        let datoRecuperado;
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};
        // vamos a recorrer los elementos requeridos para buscar 
        // si existen datos en la huds del paciente
        if (!this.datosIngreso) {
            this.datosIngreso = {};
            this.elementoRUP.requeridos.forEach(element => {
                datoRecuperado = this.findValues(this.valoresPrestacionEjecucion, element.key);
                if (datoRecuperado && datoRecuperado.length > 0) {
                    this.data[this.elementoRUP.key][element.key] =
                        ((typeof datoRecuperado[0] === 'string') ? datoRecuperado[0] : datoRecuperado[0][Object.keys(datoRecuperado[0])[0]]);
                    this.datosIngreso[element.key] = this.data[this.elementoRUP.key][element.key];
                    this.calculoIMC();
                } else {
                    this.servicioPrestacion.getByPacienteKey(this.paciente.id, element.key).subscribe(resultado => {
                        this.data[this.elementoRUP.key][element.key] = resultado;
                        this.datosIngreso[element.key] = this.data[this.elementoRUP.key][element.key];
                        this.calculoIMC();
                    });

                }
            });
        }
        // this.calculoIMC();
    }


    findValues(obj, key) { // funcion para buscar una key y recupera un array con sus valores.
        return this.findValuesHelper(obj, key, []);
    }

    findValuesHelper(obj, key, list) {
        let i;
        let children;
        if (!obj) {
            return list;
        }
        if (obj instanceof Array) {
            for (i in obj) {
                if (obj[i]) {
                    list = list.concat(this.findValuesHelper(obj[i], key, []));
                }
            }
            return list;
        }
        if (obj[key]) {
            list.push(obj[key]);
        }

        if ((typeof obj === 'object') && (obj !== null)) {
            children = Object.keys(obj);
            if (children.length > 0) {
                for (i = 0; i < children.length; i++) {
                    list = list.concat(this.findValuesHelper(obj[children[i]], key, []));
                }
            }
        }
        return list;
    }

    calculoIMC() { // Evalua las instancias en las que se pueden capturar los valores
        // calcula el imc y/o devuelve alertas al usuario.
        let peso = null;
        let talla = null;
        let imc = null;
        let key;
        let prestacionPeso = false;
        let prestacionTalla = false;
        let arrayDePeso: any;
        let arrayDeTalla: any;
        // Aca va el valor del peso si es que esta en ejecucion..
        arrayDePeso = this.findValues(this.data[this.elementoRUP.key], 'peso');
        if (arrayDePeso.length > 0) {
            peso = arrayDePeso[0];
            prestacionPeso = true;
        }
        // Aca va el valor de la talla si es que esta en ejecucion..
        arrayDeTalla = this.findValues(this.data[this.elementoRUP.key], 'talla');
        if (arrayDeTalla.length > 0) {
            talla = arrayDeTalla[0];
            prestacionTalla = true;
        }

        // Si encuentro las prestaciones que necesito. peso-talla
        if (prestacionPeso && prestacionTalla) {
            // Buscamos si las prestaciones en ejecucion tienen datos como para calcular el imc
            switch (true) {
                // Tengo ambos valores calculo y muestro el IMC
                case (peso != null && talla != null):
                    talla = talla / 100; // Paso a metros;
                    imc = peso / Math.pow(talla, 2);
                    this.mensaje.texto = '';
                    this.data[this.elementoRUP.key]['imc'] = Number(imc.toFixed(2));
                    window.setTimeout(() => {
                        this.evtData.emit(this.data);
                    });
                    break;
                // Mostramos el  Alerta de talla
                case (peso != null && talla == null):
                    this.mensaje.texto = 'Falta completar el campo talla';
                    break;
                // Mostramos alerta de peso.
                case (talla != null && peso == null):
                    this.mensaje.texto = 'Falta completar el campo peso';
                    break;
                // Se muestra alerta de talla y de peso
                default:
                    this.mensaje.texto = 'Falta completar el campo talla y el campo peso';
                    break;
            }
        } else {
            switch (true) {
                case (prestacionTalla && !prestacionPeso):
                    this.mensaje.texto = 'Completar el campo peso';
                    break;
                case (prestacionPeso && !prestacionTalla):
                    this.mensaje.texto = 'Completar el campo talla';
                    break;
                default:
                    this.mensaje.texto = 'Completar los campos talla y peso';
                    break;
            }
        }
    }


    devolverValores(obj?: any, elementoRequerido?: any) {
        if (obj[elementoRequerido.key]) {
            this.data[this.elementoRUP.key][elementoRequerido.key] = obj[elementoRequerido.key];
            this.calculoIMC();
        }
    }
}
