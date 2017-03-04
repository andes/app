import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-peso',
    templateUrl: 'peso.html'
})
export class PesoComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {
        mensaje: {
            class: "",
            texto: ""
        },
    };

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;
    }

    devolverValores() {
		this.data.mensaje = this.getMensajes();
		this.evtData.emit(this.data);
	}

	getMensajes() {
        let peso = this.data[this.tipoPrestacion.key];
        let edadEnMeses;
        edadEnMeses = 8; //Falta la edad en meses esta asi para probar.. 
        
        let mensaje: any = {
			texto: '',
			class: 'outline-danger'
		};

        if (peso) {
            if (edadEnMeses >= 3 && edadEnMeses <= 9) {
                //6 meses
                if(peso < 6.27){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 9.75){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 9 && edadEnMeses <= 15) {
                //12 meses
                if(peso < 7.65){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 11.87){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 15 && edadEnMeses <= 21) {
                //18 meses
                if(peso < 8.64){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 13.5){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 21 && edadEnMeses <= 27) {
                //24 meses
                if(peso < 9.53){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 15.9){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 27 && edadEnMeses <= 33) {
                //30 meses
                if(peso < 10.34){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 16.64){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 33 && edadEnMeses <= 39) {
                //36 meses
                if(peso < 11.8){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 18.6){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 39 && edadEnMeses <= 45) {
                //42 meses
                if(peso < 11.79){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 19.43){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 45 && edadEnMeses <= 51) {
                //48 meses
                if(peso < 12.45){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 20.83){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 51 && edadEnMeses <= 57) {
                //54 meses
                if(peso < 13.11){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 22.27){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 57 && edadEnMeses <= 63) {
                //60 meses
                if(peso < 13.74){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 23.7){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 63 && edadEnMeses <= 69) {
                //66 meses
                if(peso < 15.33){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 26.7){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 69 && edadEnMeses <= 75) {
                //72 meses
                if(peso < 15.7){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 27.7){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 75 && edadEnMeses <= 81) {
                //78 meses
                if(peso < 16.53){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 29.49){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 87 && edadEnMeses <= 93) {
                //84 meses
                if(peso < 17.36){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 31.3){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 93 && edadEnMeses <= 99) {
                //90 meses
                if(peso < 18.38){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 33.44){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 99 && edadEnMeses <= 105) {
                //96 meses
                if(peso < 19.4){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 35.6){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 105 && edadEnMeses <= 111) {
                //102 meses
                if(peso < 20.45){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 37.83){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 111 && edadEnMeses <= 117) {
                //108 meses
                if(peso < 21.48){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 40.8){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 117 && edadEnMeses <= 123) {
                //114 meses
                if(peso < 22.5){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 42.54){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 123 && edadEnMeses <= 129) {
                //120 meses
                if(peso < 23.52){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 45){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 135 && edadEnMeses <= 141) {
                //126 meses
                if(peso < 24.49){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 47.77){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 141 && edadEnMeses <= 147) {
                //132 meses
                if(peso < 25.46){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 50.54){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 147 && edadEnMeses <= 153) {
                //138 meses
                if(peso < 26.54){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 54.36){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 153 && edadEnMeses <= 159) {
                //144 meses
                if(peso < 27.6){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 58.16){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 159 && edadEnMeses <= 165) {
                //150 meses
                if(peso < 28.91){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 61.83){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 159 && edadEnMeses <= 165) {
                //156 meses
                if(peso < 30.2){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 65.48){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 165 && edadEnMeses <= 171) {
                //162 meses
                if(peso < 31.59){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 70.13){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
            if (edadEnMeses >= 171 && edadEnMeses <= 177) {
                //168 meses
                if(peso < 33){ //p3
                    mensaje.texto = 'Bajo Peso'
                }
                if(peso < 74.76){ //p97
                    mensaje.texto = 'Sobrepeso'
                }
            }
        }

        return mensaje;
    }

}