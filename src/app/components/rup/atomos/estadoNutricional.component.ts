import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-estadoNutricional',
    templateUrl: 'estadoNutricional.html'
})// @Component

export class EstadoNutricionalComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any;
    @Input('soloValores') soloValores: Boolean;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    suffix: String;
    data: any = {};
    mensaje: any = {};

    ngOnInit() {

    if (this.paciente.edad >= 2) {
        this.suffix = 'IMC';
    } else {
        this.suffix = 'PRC';
    };

    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;

    // si tengo valores cargados entonces devuelvo los resultados y mensajes
    if (this.datosIngreso) {
        this.devolverValores();
    }

} // ngOnInit()



    devolverValores() { // Hacer las validaciones

        if (this.data[this.tipoPrestacion.key] === null) {
            this.data = {};
        }

        this.mensaje = this.getMensajes();
        this.evtData.emit(this.data);
    }// devolverValores()



    getMensajes() {
        let edad; edad = this.paciente.edad;
        let prc;  prc = this.data[this.tipoPrestacion.key];
        let mensaje: any = {
            texto: '',
            class: 'outline-danger'
        };

        if (edad >= 2) {

            switch (true) {
                case (prc > 97): mensaje.texto = 'O (Obesidad)';
                    break;
                case (prc > 85 && prc <= 97): mensaje.texto = 'Sp (Sobrepeso)';
                    break;
                case (prc >= 15 && prc < 85): mensaje.texto = 'N (Normal)';
                    break;
                case (prc >= 3 && prc < 15): mensaje.texto = 'RN (Riesgo Nutricional)';
                    break;
                case (prc < 3): mensaje.texto = 'Em (Emaciación)';
                    break;
                default:
                    break;
            } // switch (true)
        }
    }// getMensajes()
}// export class EstadoNutricionalComponent

