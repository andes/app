import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Plex } from 'andes-plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { IPaciente } from './../../../interfaces/IPaciente';
import { TipoPrestacionService } from './../../../services/rup/tipoPrestacion.service';

import { FrecuenciaRespiratoriaComponent } from './../frecuenciaRespiratoria.component';
import { PesoComponent } from './../peso.component';
import { SaturacionOxigenoComponent } from './../saturacionOxigeno.component';
import { TemperaturaComponent } from './../temperatura.component';
import { TensionArterialComponent } from './../tension-arterial/tensionArterial.component';
import { ObservacionesComponent } from './../observaciones.component';

@Component({
    selector: 'rup-signos-vitales',
    templateUrl: 'signosVitales.html'
})
export class SignosVitalesComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any;
    // paciente: any; // será un IPaciente


    // resultados a devolver
    data: any = {
        valor: {},
        mensaje: {
            texto: "",
        },
    };

    // tipos de prestaciones a utilizar
    prestacionFrecuenciaCardiaca: any;
    prestacionFrecuenciaRespiratoria: any;
    prestacionPeso: any;
    prestacionSaturacionOxigeno: any;
    prestacionTemperatura: any;
    prestacionTensionArterial: any;
    prestacionObservacion: any;
    valor = {
        frecuenciaCardiaca: null,
        frecuenciaRespiratoria: null,
        peso: null,
        saturacionOxigeno: null,
        temperatura: null,
        tensionArterial: null,
        observacion: null,
    };

    constructor(private servicioTipoPrestacion: TipoPrestacionService) {
    }

    ngOnInit() {
        debugger;
        console.log('Signos Vitales Input: ', this.tipoPrestacion);
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });


        if (this.datosIngreso) {
            if (this.datosIngreso[this.tipoPrestacion.key].frecuenciaCardiaca) {
                this.valor.frecuenciaCardiaca = this.datosIngreso[this.tipoPrestacion.key].frecuenciaCardiaca;
            }
            if (this.datosIngreso[this.tipoPrestacion.key].frecuenciaRespiratoria) {
                this.valor.frecuenciaRespiratoria = this.datosIngreso[this.tipoPrestacion.key].frecuenciaRespiratoria;
            }

            if (this.datosIngreso[this.tipoPrestacion.key].peso) {
                this.valor.peso = this.datosIngreso[this.tipoPrestacion.key].peso;
            }
            if (this.datosIngreso[this.tipoPrestacion.key].saturacionOxigeno) {
                this.valor.saturacionOxigeno = this.datosIngreso[this.tipoPrestacion.key].saturacionOxigeno;
            }
            if (this.datosIngreso[this.tipoPrestacion.key].temperatura) {
                this.valor.temperatura = this.datosIngreso[this.tipoPrestacion.key].temperatura;
            }
            if (this.datosIngreso[this.tipoPrestacion.key].tensionArterial) {
                this.valor.tensionArterial = this.datosIngreso[this.tipoPrestacion.key].tensionArterial;
            }
            if (this.datosIngreso[this.tipoPrestacion.key].observacion) {
                this.valor.observacion = this.datosIngreso[this.tipoPrestacion.key].observacion;
            }



        }




        /*
                this.prestacionFrecuenciaCardiaca = {
                    "id": "5890c8aa7358af394f6d52d6",
                    "key": "frecuenciaCardiaca",
                    "nombre": "Frecuencia cardíaca",
                    "autonoma": false,
                    "activo": true,
                    "componente": "rup/frecuenciaCardiaca.component.ts"
                };
        
                this.prestacionFrecuenciaRespiratoria = {
                    "id": "5890c8f77358af394f6d52d7",
                    "key": "frecuenciaRespiratoria",
                    "nombre": "Frecuencia respiratoria",
                    "autonoma": false,
                    "activo": true,
                    "componente": "rup/frecuenciaRespiratoria.component.ts"
                };
        
                this.prestacionPeso = {
                    "id": "5890c93f7358af394f6d52d9",
                    "key": "peso",
                    "nombre": "Peso",
                    "autonoma": false,
                    "activo": true,
                    "componente": "rup/peso.component.ts"
                };
        
                this.prestacionSaturacionOxigeno = {
                    "id": "5890c92c7358af394f6d52d8",
                    "key": "saturacionOxigeno",
                    "nombre": "Saturación oxigeno",
                    "autonoma": false,
                    "activo": true,
                    "componente": "rup/saturacionOxigeno.component.ts"
                };
        
                this.prestacionTemperatura = {
                    "id": "5890ca047358af394f6d52dc",
                    "key": "temperatura",
                    "nombre": "Temperatura",
                    "autonoma": false,
                    "activo": true,
                    "componente": "rup/temperatura.component.ts"
                };
        
                this.prestacionTensionArterial = {
                    "id": "589073500c4eccd05d2a7a44",
                    "key": "tensionArterial",
                    "nombre": "Tension arterial",
                    "autonoma": false,
                    "activo": true,
                    "ejecucion": [
                        "589073500c4eccd05d2a7a42",
                        "589073500c4eccd05d2a7a43"
                    ],
                    "componente": {
                        nombre: "TensionArterialComponent",
                        ruta: "rup/tension-arterial/tensionArterial.component.ts"
                    }
                };
        
                this.prestacionObservacion = {
                    "id": "5894ba5b159eb45d71236e53",
                    "key": "observaciones",
                    "nombre": "Texto libre",
                    "autonoma": false,
                    "activo": true,
                    "componente": "rup/observaciones.component.ts"
                }
                */
    }

    onReturnComponent(valor: any, unaPrestacion: any) {
        console.log('return en signos vitales', valor);
        this.data.valor[unaPrestacion.key] = valor.valor;
        // this.data.mensaje.texto = this.data.mensaje.texto + " -" + valor.mensaje;
        this.evtData.emit(this.data);
    }

}