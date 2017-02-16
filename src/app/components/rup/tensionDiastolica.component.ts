import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-tension-diastolica',
    templateUrl: 'tensionDiastolica.html'
})
export class TensionDiastolicaComponent {
    @Input('datosIngreso') datosIngreso: any;
    @Input('paciente') paciente: IPaciente;
    @Input('tipoPrestacion') prestacion: any;
    @Input('required') required: Boolean;

    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

    tensionDiastolica: Number = null;
    mensaje: String;
    Edad: any = null;
    BajaTensionDiastolica: Number = null;
    percentiloTalla: Number = null;

    data: any = {
        valor: Number,
        mensaje: {
            texto: String,
        },
    };
    ngOnInit() {
        if (this.datosIngreso) {
            this.tensionDiastolica = this.datosIngreso;
        }
    }
    devolverValores() {
        //this.evtData.emit(this.tensionDiastolica);
        this.Edad = this.paciente.edad;
        this.percentiloTalla = 5; //Falta tomar valor del percentilo
        // agregar validaciones aca en base al paciente y el tipo de prestacion
        //Rango de edad del paciente ADULTOS
        if (this.Edad > 17 && this.Edad < 110) {
            //Rengo de tension sistolica
            if (this.tensionDiastolica > 80 && this.tensionDiastolica <= 84) {
                //rango normal
                this.mensaje = 'normal';
            }
            if (this.tensionDiastolica >= 85 && this.tensionDiastolica <= 89) {
                //rango normal-alta
                this.mensaje = 'Normal-alta';
            }
            if (this.tensionDiastolica >= 90 && this.tensionDiastolica <= 99) {
                //rango hipertension arterial grado 1 
                this.mensaje = 'Hipertensión arterial grado 1';
            }
            if (this.tensionDiastolica >= 100 && this.tensionDiastolica <= 109) {
                //rango hipertension arterial grado 2 
                this.mensaje = 'Hipertensión arterial grado 2';
            }
            if (this.tensionDiastolica >= 110) {
                //rango hipertension arterial grado 3 
                this.mensaje = 'Hipertensión arterial grado 3';
            }
            if (this.tensionDiastolica <= 40 && this.tensionDiastolica >= 60) {
                //rango hipotension
                this.mensaje = 'hipotensión';
            }
            if (this.tensionDiastolica <= 35) {
                //rango coma
                this.mensaje = 'Coma';
            }

        }

        if (this.Edad > 0 && this.Edad <= 17) {//Parametros para la edad del niño
            let mensajeTensionBaja = 'Baja tension Sistolica';
            let mensajeTensionAlta = 'Alta tension Sistolica';

            this.BajaTensionDiastolica = 70 + ( 2 * this.Edad);//Calcula el parametro que por debajo es baja tension
            if (this.percentiloTalla == 5) { //Mira la altura
                if (this.Edad == 1) { // Mira la edad
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 64) {//Mira si esta fuera de los rangos normales
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {// Mira si es baja tension
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {// caso contrario es Alta tension
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 69) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 73) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 76) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 78) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 80) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 81) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 82) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 83) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 84) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 85) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 86) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 87) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 88) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 89) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
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
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 64) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 69) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 73) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 76) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 78) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 80) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 81) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 82) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 83) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 84) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 85) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 86) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 87) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 88) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 89) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
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
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 65) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 70) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 74) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 76) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 79) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 80) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 82) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 83) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 84) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 85) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 86) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 87) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 88) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 89) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 91) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
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
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 65) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 70) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 74) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 77) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 79) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 81) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 82) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 83) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 84) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 86) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 87) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 88) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 89) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 91) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 91) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 91) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
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
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 66) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 71) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 75) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 78) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 80) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 82) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 83) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 84) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 85) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 86) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 87) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 88) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 89) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 91) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 92) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 92) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
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
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 67) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 72) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 76) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 79) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 81) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 83) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 84) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 85) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 86) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 87) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 88) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 89) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 91) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 92) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 93) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 93) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
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
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 67) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 2) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 72) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 3) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 76) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 4) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 79) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 5) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 81) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 6) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 83) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 7) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 84) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 8) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 86) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 9) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 87) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 10) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 88) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 11) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 89) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 12) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 90) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 13) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 91) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 14) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 92) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 15) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 93) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 16) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 93) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
                if (this.Edad == 17) {
                    if (this.tensionDiastolica < this.BajaTensionDiastolica || this.tensionDiastolica > 93) {
                        if (this.tensionDiastolica < this.BajaTensionDiastolica) {
                            this.mensaje = mensajeTensionBaja;
                        }
                        else {
                            this.mensaje = mensajeTensionAlta;
                        }
                    }
                }
            }
        }



        this.data.mensaje.texto = this.mensaje;
        this.data.valor = this.tensionDiastolica;
        this.evtData.emit(this.data);

    }


}