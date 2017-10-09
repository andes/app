import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-indice-de-masa-corporal',
    templateUrl: 'indiceDeMasaCorporal.html'
})
export class IndiceDeMasaCorporalComponent extends RUPComponent implements OnInit {

    public mensaje = '';
    private pesoConceptId = '27113001';
    private tallaConceptId = '14456009';

    ngOnInit() {
        if (this.elementoRUP) {
            this.calculoIMC();
        }
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

        // busquemos los valores requeridos para la formula en la prestación actual
        if (this.registro.registros && this.registro.registros.length > 0) {
            let registroPeso = this.registro.registros.find(r => r.concepto.conceptId === this.pesoConceptId);
            if (registroPeso && registroPeso.valor) {
                peso = registroPeso.valor;
            } else {
                this.prestacionesService.getByPacienteKey(this.prestacion.paciente.id, this.pesoConceptId).subscribe(resultado => {
                    if (resultado) {
                        peso = resultado[0].valor;
                    }
                });
            }

            let registroTalla = this.registro.registros.find(r => r.concepto.conceptId === this.tallaConceptId);
            if (registroTalla && registroTalla.valor) {
                talla = registroTalla.valor;
            } else {
                this.prestacionesService.getByPacienteKey(this.prestacion.paciente.id, this.tallaConceptId).subscribe(resultado => {
                    if (resultado) {
                        talla = resultado[0].valor;
                    }
                });
            }
        }

        // Si encuentro las prestaciones que necesito. peso-talla
        if (peso && talla) {
            talla = talla / 100; // Paso a metros;
            imc = peso / Math.pow(talla, 2);
            this.mensaje = '';
            this.registro.valor = Number(imc.toFixed(2));
            this.emitChange(false);
        } else {
            // Buscamos si las prestaciones en ejecucion tienen datos como para calcular el imc
            switch (true) {
                // Mostramos el  Alerta de talla
                case (peso != null && talla == null):
                    this.mensaje = 'Falta completar el campo talla';
                    break;
                // Mostramos alerta de peso.
                case (talla != null && peso == null):
                    this.mensaje = 'Falta completar el campo peso';
                    break;
                // Se muestra alerta de talla y de peso
                default:
                    this.mensaje = 'Falta completar el campo talla y el campo peso';
                    break;
            }
        }
    }

}
