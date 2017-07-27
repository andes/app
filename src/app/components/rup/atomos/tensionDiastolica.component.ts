import { Atomo } from './../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../../interfaces/IPaciente';

@Component({
    selector: 'rup-tension-diastolica',
    templateUrl: 'tensionDiastolica.html'
})
export class TensionDiastolicaComponent extends Atomo {

    getMensajes() {
        let Edad;
        // let percentiloTalla;
        let BajaTensionDiastolica;
        let tensionSistolica = this.data[this.elementoRUP.key];

        let mensaje: any = {
            texto: '',
            class: 'danger'
        };

        Edad = this.paciente.edad;
       // percentiloTalla = 5; //Falta tomar valor del percentilo

        if (tensionSistolica) {
            // agregar validaciones aca en base al paciente y el tipo de prestacion
            // Rango de edad del paciente ADULTOS
            if (Edad > 17 && Edad < 110) {
                switch (true) {
                    // Rengo de tension sistolica
                    case (tensionSistolica > 80 && tensionSistolica <= 84):
                        // rango normal
                        mensaje.texto = 'normal';
                        break;
                    case (tensionSistolica >= 85 && tensionSistolica <= 89):
                        // rango normal-alta
                        mensaje.texto = 'Normal-alta';
                        break;
                    case (tensionSistolica >= 90 && tensionSistolica <= 99):
                        // rango hipertension arterial grado 1
                        mensaje.texto = 'Hipertensión arterial grado 1';
                        break;
                    case (tensionSistolica >= 100 && tensionSistolica <= 109):
                        // rango hipertension arterial grado 2
                        mensaje.texto = 'Hipertensión arterial grado 2';
                        break;
                    case (tensionSistolica >= 110):
                        // rango hipertension arterial grado 3
                        mensaje.class = 'danger';
                        mensaje.texto = 'Hipertensión arterial grado 3';
                        break;
                    case (tensionSistolica >= 40 && tensionSistolica <= 60):
                        // rango hipotension
                        mensaje.texto = 'hipotensión';
                        break;
                    case (tensionSistolica <= 35):
                        // rango coma
                        mensaje.texto = 'Coma';
                        break;
                }
            }

            // if (Edad > 0 && Edad <= 17) {//Parametros para la edad del niño
            //     let mensajeTensionBaja = 'Baja tension Diastolica';
            //     let mensajeTensionAlta = 'Alta tension Diastolica';

            //     BajaTensionDiastolica = 70 + (2 * Edad);//Calcula el parametro que por debajo es baja tension
            //     if (percentiloTalla == 5) { //Mira la altura
            //         switch (true) {
            //             case (Edad == 1): // Mira la edad
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 64) {//Mira si esta fuera de los rangos normales
            //                     if (tensionSistolica < BajaTensionDiastolica) {// Mira si es baja tension
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {// caso contrario es Alta tension
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 69) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 73) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 76) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 78) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 80) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 81) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 82) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 83) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 84) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 85) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 86) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 87) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 88) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 89) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }


            //     }
            //     if (percentiloTalla == 10) { // altura 10
            //         switch (true) {
            //             case (Edad == 1):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 64) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 69) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 73) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 76) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 78) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 80) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 81) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 82) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 83) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 84) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 85) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 86) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 87) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 88) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 89) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }
            //     }
            //     if (percentiloTalla == 25) {//altura 25
            //         switch (true) {
            //             case (Edad == 1):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 65) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 70) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 74) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 76) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 79) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 80) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 82) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 83) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 84) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 85) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 86) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 87) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 88) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 89) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 91) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }
            //     }
            //     if (percentiloTalla == 50) {// altura 50
            //         switch (true) {
            //             case (Edad == 1):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 65) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 70) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 74) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 77) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 79) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 81) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 82) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 83) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 84) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 86) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 87) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 88) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 89) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 91) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 91) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 91) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }
            //     }
            //     if (percentiloTalla == 75) { //Altura 75..
            //         switch (true) {
            //             case (Edad == 1):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 66) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 71) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 75) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 78) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 80) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 82) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 83) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 84) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 85) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 86) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 87) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 88) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 89) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 91) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 92) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 92) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }
            //     }
            //     if (percentiloTalla == 90) { //ALtura 90
            //         switch (true) {
            //             case (Edad == 1):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 67) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 72) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 76) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 79) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 81) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 83) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 84) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 85) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 86) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 87) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 88) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 89) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 91) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 92) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 93) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 93) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }
            //     }
            //     if (percentiloTalla == 95) { //altura 95..
            //         switch (true) {
            //             case (Edad == 1):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 67) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 72) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 76) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 79) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 81) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 83) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 84) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 86) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 87) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 88) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 89) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 90) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 91) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 92) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 93) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 93) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionDiastolica || tensionSistolica > 93) {
            //                     if (tensionSistolica < BajaTensionDiastolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }
            //     }
            // }
        }

        return mensaje;

    }

}
