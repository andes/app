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
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};
    }

    onReturnComponent(obj: any, tipoPrestacion: any) {
        console.log(obj);
        console.log(tipoPrestacion);
        // inicializamos el array donde vamos a guardar todos los datos del form
        // if (this.data[this.tipoPrestacion.key] === undefined) {
        //     this.data[this.tipoPrestacion.key] = {};
        // }

        this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];
        // this.data.mensaje.texto = this.mensaje;
        // console.log(this.data);
        this.evtData.emit(this.data);
    }

}