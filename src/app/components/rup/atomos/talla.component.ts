import { PacienteComponent } from './../../paciente/paciente.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";
import * as moment from 'moment';

@Component({
    selector: 'rup-talla',
    templateUrl: 'talla.html'
})
export class TallaComponent implements OnInit {
    @Input('datosIngreso') datosIngreso: any;
    @Input('paciente') paciente: IPaciente;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('soloValores') soloValores: Boolean;
    @Input('required') required: Boolean;

    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

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

        if (this.data[this.tipoPrestacion.key] === '') {
            this.data = {};
        }
        this.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }

    getMensajes() {
        // Calculo Edad en Meses
        let edadEnMeses: any = null;
        let fechaNac: any;
        let fechaActual: Date = new Date();
        let fechaAct: any;
        let difDias: any;
        let difMeses: any;

        fechaNac = moment(this.paciente.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd');     // Diferencia en días
        edadEnMeses = Math.trunc(difDias / 30.4375); // Diferencia en Meses
        let talla = this.data[this.tipoPrestacion.key];
        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };

        if (talla) {

            //NO BORRAR.
            //Funciones para calcular percentilo.. Falta calcular el percentilo VER EL EXCEL DE EJEMPLO (Tablas de crecimiento)
            // var tablasExcel = [
            //     tablasExcel['ScolumnaAcondroplasia'] = [
            //         0.05050, 0.04950, 0.04860, 0.04770, 0.04670, 0.04585, 0.04500, 0.04420, 0.04340, 0.04270, 0.04200, 0.04140, 0.04082, 0.04031, 0.03990,
            //         0.03950, 0.03910, 0.03880, 0.03850, 0.03830, 0.03810, 0.03789, 0.03770, 0.03760, 0.03750, 0.03740, 0.03730, 0.03730, 0.03720,
            //         0.03720, 0.03720, 0.03720, 0.03720, 0.03720, 0.03720, 0.03730, 0.03730, 0.03740, 0.03740, 0.03750, 0.03760, 0.03770,
            //         0.03770, 0.03783, 0.03790, 0.03800, 0.03810, 0.03820, 0.03830, 0.03840, 0.03850, 0.03860, 0.03870, 0.03880, 0.03896,
            //     ],// array de la columa S de acondropl.. 
            //     tablasExcel['ScolumnaGarrahan'] = [
            //         0.03650, 0.03626, 0.03602, 0.03578, 0.03555, 0.03547, 0.03532, 0.03509, 0.03487, 0.03465, 0.03450, 0.03444, 0.03423, 0.03404, 0.03384, 0.03365, 0.03293, 0.03235, 0.03189,
            //         0.03156, 0.03133, 0.03121, 0.03117, 0.03120, 0.03130, 0.03146, 0.03165, 0.03188, 0.03215, 0.03243, 0.03274,
            //         0.03306, 0.03340, 0.03376, 0.03412, 0.03449, 0.03487, 0.03487, 0.03926, 0.04150, 0.04175, 0.04167, 0.04200,
            //         0.04280, 0.04410, 0.04590, 0.04832, 0.05154, 0.05419, 0.05334, 0.04973, 0.04547, 0.04214, 0.04009, 0.03881
            //     ],// array de la columa S de Garrahan..
            //     tablasExcel['McolumnaAcondroplasia'] = [
            //         45.78340, 48.54258, 51.17930, 53.57450, 55.66397, 57.43885, 58.93282, 60.20135, 61.30409, 62.29710, 63.21608,
            //         64.08308, 64.90957, 65.70403, 66.47158, 67.21161, 67.92319, 68.60876, 69.27247, 69.91640, 70.54249, 71.15445,
            //         71.75555, 72.34747, 72.93105, 73.50385, 74.06355, 74.60979, 75.14304, 75.66353, 76.17113, 76.66515, 77.14546,
            //         77.61361, 78.07148, 78.52102, 78.96378, 79.40006, 79.82899, 80.24899, 80.65891, 81.05851, 81.44788, 81.82653,
            //         82.19411, 82.55058, 82.89619, 83.23160, 83.55680, 83.87193, 84.17837, 84.47814, 84.77331, 85.06602, 85.35866
            //     ],
            //     tablasExcel['McolumnaGarrahan'] = [
            //         50.02000, 51.13600, 52.25000, 53.33000, 54.35700, 54.70100, 55.32500, 56.23400, 57.08900,
            //         57.89800, 58.43600, 58.66500, 59.39700, 60.09600, 60.76300, 61.42800, 63.87100, 65.89200, 67.63200, 69.19000, 70.63000,
            //         71.98800, 73.28400, 74.53000, 75.73500, 76.90300, 78.03600, 79.13700, 80.20700, 81.24800, 82.26200, 83.25000, 84.21200,
            //         85.14800, 86.05600, 86.93200, 87.76100, 87.77400, 95.70500, 101.87000, 107.93000, 114.15000, 120.24000, 125.92000,
            //         131.07000, 135.76000, 140.27000, 145.35000, 151.52000, 158.39000, 164.57000, 169.10000, 171.69000, 172.72000, 172.98000,
            //     ],
            //     tablasExcel['LcolumnaAcondroplasia'] = [
            //         1.000
            //     ],
            //     tablasExcel['McolumnaGarrahan'] = [
            //         1.000
            //     ]
            // ];



            // var $tablaGarrahan = 0; //Valor que viene desde un array o la base de datos
            // var $tablaAcondropl = 0;// valor que veien desde un array o la base de datos
            // var $acondropl = ''; //Valor que ingresa desde un radioButton o un select..
            // var $columnaL = 0; //valor de la tabla K
            // var $columnaM = 0; //Valor de la tabla L
            // var $columnaS = 0; // valor tabla M
            // //Calculo $S
            // if ($acondropl == 'SI') {
            //     //Falta cargar las tablas en la base de datos acondropl y garrahan
            //     $columnaS = $tablaAcondropl; //Asigna el valor de la tabla..
            //     if (this.sexo == 'femenino') {
            //         $columnaS = $columnaS + 3;
            //     }
            // }
            // else {
            //     $columnaS = $tablaGarrahan;//Asigna el valor de la tabla..
            //     if (this.sexo == 'femenino') {
            //         $columnaS = $columnaS + 3;
            //     }
            // }
            // //Fin del Calculo $columnaS


            // //Calculo $columnaM
            // if ($acondropl == 'SI') {
            //     //Falta cargar las tablas en la base de datos acondropl y garrahan
            //     $columnaM = $tablaAcondropl; //Asigna el valor de la tabla..
            //     if (this.sexo == 'femenino') {
            //         $columnaM = $columnaM + 3;
            //     }
            // }
            // else {
            //     $columnaM = $tablaGarrahan;//Asigna el valor de la tabla..
            //     if (this.sexo == 'femenino') {
            //         $columnaM = $columnaM + 3;
            //     }
            // }
            // //Fin del Calculo $columnaM


            // //Calculo $columnaL
            // if ($acondropl == 'SI') {
            //     //Falta cargar las tablas en la base de datos acondropl y garrahan
            //     $columnaL = $tablaAcondropl; //Asigna el valor de la tabla..
            //     if (this.sexo == 'femenino') {
            //         $columnaL = $columnaL + 3;
            //     }
            // }
            // else {
            //     $columnaL = $tablaGarrahan;//Asigna el valor de la tabla..
            //     if (this.sexo == 'femenino') {
            //         $columnaL = $columnaL + 3;
            //     }
            // }
            // //Fin del Calculo $columnaL

            // var $zind = (((talla) / $columnaM) ^ 1 / $columnaL - 1) / ($columnaS * $columnaM); //calculo en formula tabla N
            // var $sdMas3 = $columnaM*(1+$columnaL* $columnaS*3)^(1/$columnaL); //Calculo en tabla O 
            // var $sdMas23 = $sdMas3-$columnaM*(1+$columnaL* $columnaS*2)^(1/$columnaL); //Calculo en tabla Q
            // var $valorAbsoluto = Math.abs($zind);
            // var $valorZcore = 0; //Formula tabla Zcore
            // var $sdMenos3 = $columnaM*(1+$columnaL* $columnaS*-3)^(1/$columnaL); //formula tabla P
            // var $sdMenos23 = $columnaM*(1+$columnaL* $columnaS*-2)^(1/$columnaL)-$sdMenos3; //Formula tabla R

            // //Calculo valorzcore
            // if ($valorAbsoluto <= 3) {
            //     if ($zind > 3) {
            //         $valorZcore = 3 + (talla - $sdMas3) / $sdMas23;
            //     }
            //     else {
            //         $valorZcore = -3 + (talla - $sdMenos3) / $sdMenos23
            //     }
            // }
            // else {
            //     $valorZcore = $zind;
            //}
            //Fin calculo valorzcore


            //N = zind -> =((($H12)/L12)^1/K12-1)/(M12*K12)
            //O = SD + 3 -> =$L2*(1+$K2* $M2*3)^(1/$K2) 
            //Q = SD +23 -> =O5-$L5*(1+$K5* $M5*2)^(1/$K5)
            //P = SD - 3 -> =$L2*(1+$K2* $M2*-3)^(1/$K2)
            //R = SD -23 -> =$L2*(1+$K2* $M2*-2)^(1/$K2)-P2
            //K = L -> =SI($G2="si";BUSCARV($C2;acondropl!$A$5:$M$59;2+SI($F2="V";;3));BUSCARV($C2;garrahan!$A$5:$M$59;2+SI($F2="V";;3)))
            //L = M -> =SI($G2="si";BUSCARV($C2;acondropl!$A$5:$M$59;3+SI($F2="V";;3));BUSCARV($C2;garrahan!$A$5:$M$59;3+SI($F2="V";;3)))
            //M = S -> =SI($G5="si";BUSCARV($C5;acondropl!$A$5:$M$59;4+SI($F5="V";;3));BUSCARV($C5;garrahan!$A$5:$M$59;4+SI($F5="V";;3)))

            switch (true) {
                case (edadEnMeses >= 3 && edadEnMeses <= 9):
                    //6 meses
                    if (talla < 63.34) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 71.9) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 9 && edadEnMeses <= 15):
                    //12 meses
                    if (talla < 70.99) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 80.51) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 15 && edadEnMeses <= 21):
                    //18 meses
                    if (talla < 76.86) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 87.66) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 21 && edadEnMeses <= 27):
                    //24 meses
                    if (talla < 81.7) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 93.94) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 27 && edadEnMeses <= 33):
                    //30 meses
                    if (talla < 85.11) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 98.75) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 33 && edadEnMeses <= 39):
                    //36 meses
                    if (talla < 88.66) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 103.5) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 39 && edadEnMeses <= 45):
                    //42 meses
                    if (talla < 91.91) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 107.79) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 45 && edadEnMeses <= 51):
                    //48 meses
                    if (talla < 94.95) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 111.71) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 51 && edadEnMeses <= 57):
                    //54 meses
                    if (talla < 97.83) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 115.51) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 57 && edadEnMeses <= 63):
                    //60 meses
                    if (talla < 100.72) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 119.2) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 63 && edadEnMeses <= 69):
                    //66 meses
                    if (talla < 103.43) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 122.39) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 69 && edadEnMeses <= 75):
                    //72 meses
                    if (talla < 104.48) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 123.6) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 75 && edadEnMeses <= 81):
                    //78 meses
                    if (talla < 107.49) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 127.1) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 87 && edadEnMeses <= 93):
                    //84 meses
                    if (talla < 110.2) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 130.4) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 93 && edadEnMeses <= 99):
                    //90 meses
                    if (talla < 112.64) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 133.56) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 99 && edadEnMeses <= 105):
                    //96 meses
                    if (talla < 115.1) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 136.7) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 105 && edadEnMeses <= 111):
                    //102 meses
                    if (talla < 117.34) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 139.66) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 111 && edadEnMeses <= 117):
                    //108 meses
                    if (talla < 119.6) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 142.6) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 117 && edadEnMeses <= 123):
                    //114 meses
                    if (talla < 121.44) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 145.56) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 123 && edadEnMeses <= 129):
                    //120 meses
                    if (talla < 123.3) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 148.5) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 135 && edadEnMeses <= 141):
                    //126 meses
                    if (talla < 125.15) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 150.95) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 141 && edadEnMeses <= 147):
                    //132 meses
                    if (talla < 127) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 153.4) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 147 && edadEnMeses <= 153):
                    //138 meses
                    if (talla < 128.9) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 156.5) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 153 && edadEnMeses <= 159):
                    //144 meses
                    if (talla < 130.8) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 159.6) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 159 && edadEnMeses <= 165):
                    //150 meses
                    if (talla < 132.19) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 164.31) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 159 && edadEnMeses <= 165):
                    //156 meses
                    if (talla < 133.6) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 169) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 165 && edadEnMeses <= 171):
                    //162 meses
                    if (talla < 137.59) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 172.31) { //p97
                        mensaje.texto = 'Demasiado alto'
                    }
                    break;
                case (edadEnMeses >= 171 && edadEnMeses <= 177):
                    //168 meses
                    if (talla < 141.6) { //p3
                        mensaje.texto = 'Baja estatura'
                    }
                    if (talla > 175.6) { //p97
                        mensaje.texto = 'Demasiado alto'

                    }
                    break;
            }
        }
        return mensaje;
    }
}