import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-frecuencia-cardiaca',
    templateUrl: 'frecuenciaCardiaca.html'
})
export class FrecuenciaCardiacaComponent implements OnInit {
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    frecuenciaCardiaca: Number = null;
    sexo: any = null;
    mensaje: String = null;
    data: any = {
        valor: this.frecuenciaCardiaca,
        mensaje: {
            texto: String,
        },
    };
    ngOnInit() {
         if (this.datosIngreso) {

            this.frecuenciaCardiaca = this.datosIngreso;
        }
    }

    devolverValores() {
        this.sexo = this.paciente.sexo
        if (this.sexo == 'masculino') {
            if (this.paciente.edad >= 20 && this.paciente.edad <= 29) {
                if (this.frecuenciaCardiaca < 86) {
                    this.mensaje = 'Inadecuado'
                }
                if (this.frecuenciaCardiaca <= 62 && this.frecuenciaCardiaca >= 68) {
                    this.mensaje = 'Buena'
                }
                if (this.frecuenciaCardiaca >= 60) {
                    this.mensaje = 'exelente'
                }
            }
            if (this.paciente.edad >= 30 && this.paciente.edad <= 39) {
                if (this.frecuenciaCardiaca < 86) {
                    this.mensaje = 'Inadecuado'
                }
                if (this.frecuenciaCardiaca <= 64 && this.frecuenciaCardiaca >= 70) {
                    this.mensaje = 'Buena'
                }
                if (this.frecuenciaCardiaca >= 62) {
                    this.mensaje = 'exelente'
                }
            }
            if (this.paciente.edad >= 50) {
                if (this.frecuenciaCardiaca < 90) {
                    this.mensaje = 'Inadecuado'
                }
                if (this.frecuenciaCardiaca <= 68 && this.frecuenciaCardiaca >= 74) {
                    this.mensaje = 'Buena'
                }
                if (this.frecuenciaCardiaca >= 66) {
                    this.mensaje = 'exelente'
                }
            }
        }
        if (this.sexo == 'femenino') {
            if (this.paciente.edad >= 20 && this.paciente.edad <= 29) {
                if (this.frecuenciaCardiaca < 96) {
                    this.mensaje = 'Inadecuado'
                }
                if (this.frecuenciaCardiaca <= 72 && this.frecuenciaCardiaca >= 76) {
                    this.mensaje = 'Buena'
                }
                if (this.frecuenciaCardiaca >= 70) {
                    this.mensaje = 'exelente'
                }
            }
            if (this.paciente.edad >= 30 && this.paciente.edad <= 39) {
                if (this.frecuenciaCardiaca < 98) {
                    this.mensaje = 'Inadecuado'
                }
                if (this.frecuenciaCardiaca <= 72 && this.frecuenciaCardiaca >= 78) {
                    this.mensaje = 'Buena'
                }
                if (this.frecuenciaCardiaca >= 70) {
                    this.mensaje = 'exelente'
                }
            }
            if (this.paciente.edad >= 40 && this.paciente.edad <= 49) {
                if (this.frecuenciaCardiaca < 100) {
                    this.mensaje = 'Inadecuado'
                }
                if (this.frecuenciaCardiaca <= 74 && this.frecuenciaCardiaca >= 78) {
                    this.mensaje = 'Buena'
                }
                if (this.frecuenciaCardiaca >= 72) {
                    this.mensaje = 'exelente'
                }
            }
            if (this.paciente.edad >= 50) {
                if (this.frecuenciaCardiaca < 104) {
                    this.mensaje = 'Inadecuado'
                }
                if (this.frecuenciaCardiaca <= 76 && this.frecuenciaCardiaca >= 78) {
                    this.mensaje = 'Buena'
                }
                if (this.frecuenciaCardiaca >= 74) {
                    this.mensaje = 'exelente'
                }
            }
        }
        this.data.mensaje.texto = this.mensaje;
        this.data.valor = this.frecuenciaCardiaca;
        this.evtData.emit(this.data);
    }

}