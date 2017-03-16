import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../interfaces/IPaciente";

@Component({
    selector: 'rup-frecuencia-cardiaca',
    templateUrl: 'frecuenciaCardiaca.html'
})
export class FrecuenciaCardiacaComponent implements OnInit {
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Input('soloValores') soloValores: Boolean;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {
        mensaje: {
            class: "",
            texto: ""
        },
    };

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;

        // si tengo valores cargados entonces devuelvo los resultados y mensajes
		if (this.datosIngreso) {
            this.devolverValores();
        }
    }

    devolverValores() {
        this.data.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }

    getMensajes() {
        let Edad;
        let Sexo;
        let frecuenciaCardiaca;
        let mensaje : any = {
            texto: '',
            class: 'outline-danger'
        };

        Sexo = this.paciente.sexo
        Edad = this.paciente.edad; //Solo es para probar!! 
        frecuenciaCardiaca = this.data[this.tipoPrestacion.key];

        if (frecuenciaCardiaca) {
            if (Sexo == 'masculino') {
                if (Edad >= 20 && Edad <= 29) {
                    if (frecuenciaCardiaca < 86) {
                        mensaje.texto = 'Inadecuado'
                    }
                    if (frecuenciaCardiaca <= 62 && frecuenciaCardiaca >= 68) {
                        mensaje.texto = 'Buena'
                    }
                    if (frecuenciaCardiaca >= 60) {
                        mensaje.texto = 'exelente'
                    }
                }
                if (Edad >= 30 && Edad <= 39) {
                    if (frecuenciaCardiaca < 86) {
                        mensaje.texto = 'Inadecuado'
                    }
                    if (frecuenciaCardiaca <= 64 && frecuenciaCardiaca >= 70) {
                        mensaje.texto = 'Buena'
                    }
                    if (frecuenciaCardiaca >= 62) {
                        mensaje.texto = 'exelente'
                    }
                }
                if (Edad >= 50) {
                    if (frecuenciaCardiaca < 90) {
                        mensaje.texto = 'Inadecuado'
                    }
                    if (frecuenciaCardiaca <= 68 && frecuenciaCardiaca >= 74) {
                        mensaje.texto = 'Buena'
                    }
                    if (frecuenciaCardiaca >= 66) {
                        mensaje.texto = 'exelente'
                    }
                }
            }
            if (Sexo == 'femenino') {
                if (Edad >= 20 && Edad <= 29) {
                    if (frecuenciaCardiaca < 96) {
                        mensaje.texto = 'Inadecuado'
                    }
                    if (frecuenciaCardiaca <= 72 && frecuenciaCardiaca >= 76) {
                        mensaje.texto = 'Buena'
                    }
                    if (frecuenciaCardiaca >= 70) {
                        mensaje.texto = 'exelente'
                    }
                }
                if (Edad >= 30 && Edad <= 39) {
                    if (frecuenciaCardiaca < 98) {
                        mensaje.texto = 'Inadecuado'
                    }
                    if (frecuenciaCardiaca <= 72 && frecuenciaCardiaca >= 78) {
                        mensaje.texto = 'Buena'
                    }
                    if (frecuenciaCardiaca >= 70) {
                        mensaje.texto = 'exelente'
                    }
                }
                if (Edad >= 40 && Edad <= 49) {
                    if (frecuenciaCardiaca < 100) {
                        mensaje.texto = 'Inadecuado'
                    }
                    if (frecuenciaCardiaca <= 74 && frecuenciaCardiaca >= 78) {
                        mensaje.texto = 'Buena'
                    }
                    if (frecuenciaCardiaca >= 72) {
                        mensaje.texto = 'exelente'
                    }
                }
                if (Edad >= 50) {
                    if (frecuenciaCardiaca < 104) {
                        mensaje.texto = 'Inadecuado'
                    }
                    if (frecuenciaCardiaca <= 76 && frecuenciaCardiaca >= 78) {
                        mensaje.texto = 'Buena'
                    }
                    if (frecuenciaCardiaca >= 74) {
                        mensaje.texto = 'exelente'
                    }
                }
            }
        }
 
 
        return mensaje;
    }

}