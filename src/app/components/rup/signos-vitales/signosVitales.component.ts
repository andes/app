import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';

// import { IPaciente } from './../../../interfaces/IPaciente';
// import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';

@Component({
    selector: 'rup-signos-vitales',
    templateUrl: 'signosVitales.html'
})
export class SignosVitalesComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any;

    // resultados a devolver
    data: any = {
        mensaje: {
            texto: '',
        },
    };

    // tipos de prestaciones a utilizar
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
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });

        // si vienen datos por input, los asignamos a nuestro objeto data
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

    }

    onReturnComponent(obj: any, unaPrestacion: any) {
        // inicializamos el array donde vamos a guardar todos los datos del form
        if (this.data[this.tipoPrestacion.key] === undefined) {
            this.data[this.tipoPrestacion.key] = {};
        }

        this.data[this.tipoPrestacion.key][unaPrestacion.key] = obj.valor;
        // this.data.mensaje.texto = this.mensaje;

        this.evtData.emit(this.data);
    }

}