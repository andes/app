import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';


@Component({
    selector: 'rup-tension-sistolica',
    templateUrl: 'tensionSistolica.html'
})
export class TensionSistolicaComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    tensionSistolica: Number = null;
    mensaje: String = "";
    class: String = "";
    percentiloTalla: Number = null;
    BajaTensionSistolica: Number = null;
    Edad: any = null;

    data: any = {
        valor: this.tensionSistolica,
        mensaje: {
            class: "",
            texto: ""
        },
    };

    ngOnInit() {
        if (this.datosIngreso) {
            this.tensionSistolica = this.datosIngreso;
        }
    }
    devolverValores() {
        this.class = 'outline-danger';
        this.Edad = 7//this.paciente.edad;
        this.percentiloTalla = 5; //Falta tomar valor del percentilo
        //console.log(this.paciente);
        // agregar validaciones aca en base al paciente y el tipo de prestacion
        //Rango de edad del paciente ADULTOS
        if (this.Edad > 17 && this.Edad < 110) {
            //Rengo de tension sistolica
            if (this.tensionSistolica == 120) {
                //rango optima
                this.mensaje = 'optima';
            }
            if (this.tensionSistolica > 120 && this.tensionSistolica <= 129) {
                //rango normal
                this.mensaje = 'Normal';
            }
            if (this.tensionSistolica >= 130 && this.tensionSistolica <= 139) {
                //rango normal-alta
                this.mensaje = 'Normal-alta';
            }
            if (this.tensionSistolica >= 140 && this.tensionSistolica <= 159) {
                //rango hipertension arterial grado 1 
                this.mensaje = 'Hipertensión arterial grado 1';
            }
            if (this.tensionSistolica >= 160 && this.tensionSistolica <= 179) {
                //rango hipertension arterial grado 2 
                this.mensaje = 'Hipertensión arterial grado 2';
            }
            if (this.tensionSistolica >= 180) {
                //rango hipertension arterial grado 3 
                this.mensaje = 'Hipertensión arterial grado 3';
            }
            if (this.tensionSistolica <= 60 && this.tensionSistolica >= 80) {
                //rango hipotension
                this.mensaje = 'hipotensión';
            }
            if (this.tensionSistolica <= 50) {
                //rango coma
                this.mensaje = 'Coma';
            }

        }
        if (this.Edad > 0 && this.Edad <= 17) {//Parametros para la edad del niño
            let mensajeTensionBaja = 'Baja tension Sistolica';
            let mensajeTensionAlta = 'Alta tension Sistolica';

            this.BajaTensionSistolica = 70 + ( 2 * this.Edad);//Calcula el parametro que por debajo es baja tension
            if (this.percentiloTalla == 5) { //Mira la altura
                if (this.Edad == 1) { // Mira la edad
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 108) {//Mira si esta fuera de los rangos normales
                        if (this.tensionSistolica < this.BajaTensionSistolica) {// Mira si es baja tension
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {// caso contrario es Alta tension
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 109) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 111) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 112) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 114) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 115) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 117) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 119) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 121) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 123) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 125) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 127) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 128) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 130) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 131) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 132) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 133) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }


            }
            if (this.percentiloTalla == 10) { // altura 10
                if (this.Edad == 1) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 108) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 110) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 111) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 113) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 114) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 116) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 118) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 120) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 121) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 123) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 125) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 127) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 129) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 131) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 132) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 133) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 133) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
            }
            if (this.percentiloTalla == 25) {//altura 25
                if (this.Edad == 1) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 109) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 111) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 113) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 114) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 116) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 117) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 119) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 121) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 123) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 125) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 126) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 128) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 130) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 132) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 133) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 134) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 134) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
            }
            if (this.percentiloTalla == 50) {// altura 50
                if (this.Edad == 1) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 111) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 112) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 114) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 115) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 117) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 119) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 120) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 122) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 124) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 126) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 128) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 130) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 132) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 133) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 134) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 135) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 136) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
            }
            if (this.percentiloTalla == 75) { //Altura 75
                if (this.Edad == 1) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 112) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 114) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 115) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 117) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 118) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 120) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 122) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 123) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 125) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 127) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 129) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 131) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 133) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 135) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 136) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 137) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 137) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
            }
            if (this.percentiloTalla == 90) { //ALtura 90
                if (this.Edad == 1) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 113) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 115) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 116) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 118) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 120) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 121) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 123) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 125) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 127) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 129) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 130) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 132) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 134) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 136) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 137) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 138) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 138) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
            }
            if (this.percentiloTalla == 95) { //altura 95
                if (this.Edad == 1) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 114) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 116) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 117) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 119) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 120) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 122) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 124) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 125) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 127) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 129) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 131) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 133) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 135) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 136) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 138) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 139) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionSistolica < this.BajaTensionSistolica || this.tensionSistolica > 139) {
                        if (this.tensionSistolica < this.BajaTensionSistolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
            }
        }
        this.data.mensaje.class = this.class;
        this.data.mensaje.texto = this.mensaje;
        this.data.valor = this.tensionSistolica;
        this.evtData.emit(this.data);
    }
}