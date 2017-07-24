import { Atomo } from './../core/atomoComponent';
import { RupComponent } from './../rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';
@Component({
    selector: 'rup-peso',
    templateUrl: 'peso.html'
})
export class PesoComponent extends Atomo{
    getMensajes() {
        let peso = this.data[this.elementoRUP.key];
        let edadEnMeses;
        let sexo = this.paciente.sexo;
        // edadEnMeses = 8; //Falta la edad en meses esta asi para probar..

        let mensaje: any = {
            texto: '',
            class: 'danger'
        };

        // Calculo Edad en Meses
        let edadMeses: any = null;
        let fechaNac: any;
        let fechaActual: Date = new Date();
        let fechaAct: any;
        let difDias: any;
        let difMeses: any;

        fechaNac = moment(this.paciente.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd');     // Diferencia en días
        edadEnMeses = Math.trunc(difDias / 30.4375); // Diferencia en Meses
        if (peso) {
            // Peso niño
                switch (true) {
                    case edadEnMeses >= 3 && edadEnMeses <= 9: // 6 meses
                        if (sexo === 'masculino') {
                            if (peso < 6.27) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 9.75) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 5.62) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 9.2) { mensaje.texto = 'Sobrepeso'; }; // p97
                        };
                        break;

                    case edadEnMeses > 9 && edadEnMeses <= 15: // 12 meses
                        if (sexo === 'masculino') {
                            if (peso < 7.65) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 11.87) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 6.91) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 11.31) { mensaje.texto = 'Sobrepeso'; }; // p97
                        };
                        break;

                    case (edadEnMeses > 15 && edadEnMeses <= 21): // 18 meses
                        if (sexo === 'masculino') {
                            if (peso < 8.64) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 13.5) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 7.89) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 12.95) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 21 && edadEnMeses <= 27): // 24 meses
                        if (sexo === 'masculino') {
                            if (peso < 9.53) {
                                mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 15.9) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 8.84) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 14.58) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses >= 27 && edadEnMeses <= 33): // 30 meses
                        if (sexo === 'masculino') {
                            if (peso < 10.34) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 16.64) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 9.75) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 16.19) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 33 && edadEnMeses <= 39): // 36 meses
                        if (sexo === 'masculino') {
                            if (peso < 11.8) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 18.6) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 10.55) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 17.75) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses >= 39 && edadEnMeses <= 45): // 42 meses
                        if (sexo === 'masculino') {
                            if (peso < 11.79) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 19.43) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 11.29) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 19.35) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 45 && edadEnMeses <= 51): // 48 meses
                        if (sexo === 'masculino') {
                            if (peso < 12.45) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 20.83) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 11.99) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 20.99) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 51 && edadEnMeses <= 57):  // 54 meses
                        if (sexo === 'masculino') {
                            if (peso < 13.11) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 22.27) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 12.66) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 22.6) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses >= 57 && edadEnMeses <= 63): // 60 meses
                        if (sexo === 'masculino') {
                            if (peso < 13.74) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 23.7) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 13.32) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 24.22) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 63 && edadEnMeses <= 69): // 66 meses
                        if (sexo === 'masculino') {
                            if (peso < 15.33) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 26.7) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 14.77) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 27.03) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses >= 69 && edadEnMeses <= 75): // 72 meses
                        if (sexo === 'masculino') {
                            if (peso < 15.7) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 27.7) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 15.65) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 27.35) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 75 && edadEnMeses <= 81): // 78 meses
                        if (sexo === 'masculino') {
                            if (peso < 16.53) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso < 29.49) { mensaje.texto = 'Sobrepeso'; }; // p97
                         } else {
                            if (peso < 16.41) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 29.27) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses >= 81 && edadEnMeses <= 87): // 84 meses
                        if (sexo === 'masculino') {
                            if (peso < 17.36) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 31.3) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 17.08) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 31.32) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 87 && edadEnMeses <= 93): // 90 meses
                        if (sexo === 'masculino') {
                            if (peso < 18.38) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 33.44) { mensaje.texto = 'Sobrepeso'; }; // p97
                         } else {
                            if (peso < 17.89) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 33.57) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses >= 93 && edadEnMeses <= 99): // 96 meses
                        if (sexo === 'masculino') {
                            if (peso < 19.4) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 35.6) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 18.7) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 35.8) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 99 && edadEnMeses <= 105): // 102 meses
                        if (sexo === 'masculino') {
                            if (peso < 20.45) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 37.83) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 19.66) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 38.26) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses >= 105 && edadEnMeses <= 111): // 108 meses
                        if (sexo === 'masculino') {
                            if (peso < 21.48) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 40.8) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 20.64) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 40.72) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 111 && edadEnMeses <= 117): // 114 meses
                        if (sexo === 'masculino') {
                            if (peso < 22.5) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 42.54) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 21.65) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 43.33) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 117 && edadEnMeses <= 123): // 120 meses
                        if (sexo === 'masculino') {
                            if (peso < 23.52) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 45) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 22.64) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 45.92) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 123 && edadEnMeses <= 129): // 126 meses
                         if (sexo === 'masculino') {
                            if (peso < 24.49) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 47.77) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 23.86) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 49.52) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 129 && edadEnMeses <= 135): // 132 meses
                        if (sexo === 'masculino') {
                            if (peso < 25.46) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 50.54) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 25.06) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 53.12) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 135 && edadEnMeses <= 141): // 138 meses
                        if (sexo === 'masculino') {
                            if (peso < 26.54) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 54.36) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 26.63) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 56.55) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 141 && edadEnMeses <= 147):  // 144 meses
                        if (sexo === 'masculino') {
                            if (peso < 27.6) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 58.16) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 28.2) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 59.98) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 147 && edadEnMeses <= 153): // 150 meses
                        if (sexo === 'masculino') {
                            if (peso < 28.91) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 61.83) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 30.16) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 62.4) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 153 && edadEnMeses <= 159): // 156 meses
                        if (sexo === 'masculino') {
                            if (peso < 30.2) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 65.48) { mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 32.1) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 64.82) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 159 && edadEnMeses <= 165):  // 162 meses
                        if (sexo === 'masculino') {
                            if (peso < 31.59) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 70.13) {mensaje.texto = 'Sobrepeso'; }; // p97
                        } else {
                            if (peso < 34.32) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 66.58) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    case (edadEnMeses > 165 && edadEnMeses <= 171):  // 168 meses
                         if (sexo === 'masculino') {
                            if (peso < 33) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 74.76) {mensaje.texto = 'Sobrepeso'; }; // p97
                         } else {
                            if (peso < 36.54) { mensaje.texto = 'Bajo Peso'; }; // p3
                            if (peso > 68.34) { mensaje.texto = 'Sobrepeso'; }; // p97
                            };
                        break;

                    default: mensaje.texto = '';
                }
        }
        return mensaje;
    }
}
