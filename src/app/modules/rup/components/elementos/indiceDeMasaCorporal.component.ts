import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { RupElement } from '.';

@Component({
    selector: 'rup-indice-de-masa-corporal',
    templateUrl: 'indiceDeMasaCorporal.html'
})
@RupElement('IndiceDeMasaCorporalComponent')
export class IndiceDeMasaCorporalComponent extends RUPComponent implements OnInit {

    conceptosRequeridos: any[] = [];
    peso: any;
    talla: any;
    registroTalla: any;
    registroPeso: any;
    public alerta = '';
    private pesoConceptId = '27113001';
    private tallaConceptId = '14456009';
    registro: any = {};

    // utilizado para el form, asi nos permite dejar el input como disabled
    public valorImc: Number;
    termCapitalizado: string;

    ngOnInit() {

        if (!this.soloValores) {
            // Observa cuando cambia la propiedad 'percentiloPeso' en otro elemento RUP
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                    if (this.elementoRUP) {
                        this.calculoIMC();
                    }
                }
            });
        }
        if (this.registro.valor) {
            this.mensaje = this.getMensajes();
            this.calculoIMC();
        }

        this.termCapitalizado = this.elementoRUP.conceptos[0].term[0].toUpperCase() + this.elementoRUP.conceptos[0].term.slice(1).toLowerCase();
    }

    cumpleReglasParams(elementoRUP) {
        if (this.params && this.params.reglas) {
            if (this.params.reglas.visualizacion) {
                if (this.params.reglas.visualizacion.ocultar) {
                    return this.params.reglas.visualizacion.ocultar.atomos.findIndex(x => x === elementoRUP.conceptos[0].conceptId) === -1;
                }
            }
        }
        return 2;
    }

    existeConcepto(elementoRUP, conceptId) {
        return elementoRUP.conceptos.find(c => {
            return c.conceptId === conceptId;
        });
    }

    // Evalua las instancias en las que se pueden capturar los valores
    calculoIMC() {
        // calcula el imc y/o devuelve alertas al usuario.
        let imc = null;

        // busquemos los valores requeridos para la formula en la prestación actual
        if (this.registro && this.registro.registros && this.registro.registros.length > 0) {
            // this.registroPeso = this.buscarConceptoDeep(this.prestacion.ejecucion.registros, this.pesoConceptId);
            this.registroPeso = this.registro.registros.find(r => r.concepto.conceptId === this.pesoConceptId);

            if (this.registroPeso && this.registroPeso.valor) {
                this.peso = this.registroPeso.valor;
            } else {
                this.peso = null;
            }
            // this.registroTalla = this.buscarConceptoDeep(this.prestacion.ejecucion.registros, this.tallaConceptId);
            this.registroTalla = this.registro.registros.find(r => r.concepto.conceptId === this.tallaConceptId);

            if (this.registroTalla && this.registroTalla.valor) {
                this.talla = this.registroTalla.valor;
            } else {
                this.talla = null;
            }

        } else {

            // let this.registroPeso = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.pesoConceptId);
            this.registroPeso = this.buscarConceptoDeep(this.prestacion.ejecucion.registros, this.pesoConceptId);

            if (this.registroPeso && this.registroPeso.valor) {
                this.peso = this.registroPeso.valor;
            }

            this.registroTalla = this.buscarConceptoDeep(this.prestacion.ejecucion.registros, this.tallaConceptId);

            if (this.registroTalla && this.registroTalla.valor) {
                this.talla = this.registroTalla.valor;
            }
        }
        if (this.conceptosRequeridos.length === 2) {
            this.peso = this.conceptosRequeridos.find(x => x.concepto.conceptId === this.pesoConceptId).valor;
            this.talla = this.conceptosRequeridos.find(x => x.concepto.conceptId === this.tallaConceptId).valor;
        }

        // Si encuentro las prestaciones que necesito. peso-talla
        if (this.peso && this.talla) {
            this.talla = this.talla / 100; // Paso a metros;
            imc = this.peso / Math.pow(this.talla, 2);
            this.alerta = '';
            this.registro.valor = Number(imc.toFixed(2));
            this.valorImc = this.registro['valor'];
            this.emitChange(false);
        } else {
            this.valorImc = null;
            this.registro.valor = null;
            // Buscamos si las prestaciones en ejecucion tienen datos como para calcular el imc
            switch (true) {
                // Mostramos el  Alerta de talla
                case (this.peso && this.talla === null):
                    this.alerta = 'Falta completar el campo talla';
                    break;
                // Mostramos alerta de peso.
                case (this.talla && this.peso === null):
                    this.alerta = 'Falta completar el campo peso';
                    break;
                // Se muestra alerta de talla y de peso
                default:
                    this.alerta = 'Falta completar el campo talla y el campo peso';
                    break;
            }
        }
    }

    buscarConceptoDeep(registros: any[], conceptId) {
        if (registros) {
            for (let i = 0; i < registros.length; i++) {
                if (registros[i].concepto.conceptId === conceptId) {
                    this.conceptosRequeridos.push(registros[i]);
                } else {
                    this.buscarConceptoDeep(registros[i].registros, conceptId);
                }
            }
        }

    }

}
