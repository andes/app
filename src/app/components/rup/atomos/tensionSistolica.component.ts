import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";


@Component({
    selector: 'rup-tension-sistolica',
    templateUrl: 'tensionSistolica.html'
})
export class TensionSistolicaComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Input('soloValores') soloValores: Boolean;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {};
    mensaje: any = {};

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;

        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            this.devolverValores();
        }
    }

    devolverValores() {
            this.mensaje = this.getMensajes();
            this.evtData.emit(this.data);
    }

    getMensajes() {
        let Edad;
        let percentiloTalla;
        let BajaTensionSistolica;
        let tensionSistolica = this.data[this.tipoPrestacion.key];

        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };

        Edad = this.paciente.edad;
        //percentiloTalla = 5; //Falta tomar valor del percentilo


        //Rango de edad del paciente ADULTOS
        if (tensionSistolica) {

            if (Edad > 17 && Edad < 110) {
                switch (true) {
                    //Rengo de tension sistolica
                    case (tensionSistolica == 120):
                        //rango optima
                        mensaje.texto = 'optima';
                        break;
                    case (tensionSistolica > 120 && tensionSistolica <= 129):
                        //rango normal
                        mensaje.texto = 'Normal';
                        break;
                    case (tensionSistolica >= 130 && tensionSistolica <= 139):
                        //rango normal-alta
                        mensaje.texto = 'Normal-alta';
                        break;
                    case (tensionSistolica >= 140 && tensionSistolica <= 159):
                        //rango hipertension arterial grado 1 
                        mensaje.texto = 'Hipertensión arterial grado 1';
                        break;
                    case (tensionSistolica >= 160 && tensionSistolica <= 179):
                        //rango hipertension arterial grado 2 
                        mensaje.texto = 'Hipertensión arterial grado 2';
                        break;
                    case (tensionSistolica >= 180):
                        //rango hipertension arterial grado 3 
                        mensaje.texto = 'Hipertensión arterial grado 3';
                        break;
                    case (tensionSistolica <= 60 && tensionSistolica >= 80):
                        //rango hipotension
                        mensaje.texto = 'hipotensión';
                        break;
                    case (tensionSistolica <= 50):
                        //rango coma
                        mensaje.texto = 'Coma';
                        break;
                }
            }
            // if (Edad > 0 && Edad <= 17) {//Parametros para la edad del niño
            //     let mensajeTensionBaja = 'Baja tension Sistolica';
            //     let mensajeTensionAlta = 'Alta tension Sistolica';

            //     BajaTensionSistolica = 70 + (2 * Edad);//Calcula el parametro que por debajo es baja tension
            //     if (percentiloTalla == 5) { //Mira la altura
            //         switch (true) {
            //             case (Edad == 1): // Mira la edad
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 108) {//Mira si esta fuera de los rangos normales
            //                     if (tensionSistolica < BajaTensionSistolica) {// Mira si es baja tension
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {// caso contrario es Alta tension
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 109) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 111) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 112) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 114) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 115) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 117) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 119) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 121) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 123) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 125) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 127) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 128) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 130) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 131) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 132) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 133) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
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
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 108) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 110) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 111) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 113) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 114) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 116) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 118) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 120) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 121) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 123) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 125) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 127) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 129) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 131) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 132) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 133) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 133) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
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
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 109) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 111) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 113) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 114) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 116) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 117) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 119) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 121) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 123) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 125) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 126) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 128) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 130) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 132) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 133) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 134) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 134) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
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
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 111) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 112) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 114) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 115) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 117) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 119) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 120) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 122) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 124) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 126) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 128) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 130) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 132) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 133) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 134) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 135) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 136) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //         }
            //     }
            //     if (percentiloTalla == 75) { //Altura 75
            //         switch (true) {
            //             case (Edad == 1):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 112) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 114) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 115) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 117) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 118) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 120) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 122) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 123) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 125) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 127) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 129) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 131) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 133) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 135) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 136) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 137) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 137) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
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
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 113) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 115) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 116) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 118) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 120) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 121) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 123) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 125) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 127) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 129) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 130) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 132) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 134) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 136) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 137) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 138) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 138) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
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
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 114) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 2):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 116) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 3):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 117) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 4):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 119) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 5):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 120) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 6):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 122) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 7):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 124) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 8):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 125) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 9):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 127) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 10):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 129) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 11):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 131) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 12):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 133) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 13):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 135) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 14):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 136) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 15):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 138) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 16):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 139) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
            //                         mensaje.texto = mensajeTensionBaja;
            //                     }
            //                     else {
            //                         mensaje.texto = mensajeTensionAlta;
            //                     }
            //                 }
            //                 break;
            //             case (Edad == 17):
            //                 if (tensionSistolica < BajaTensionSistolica || tensionSistolica > 139) {
            //                     if (tensionSistolica < BajaTensionSistolica) {
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