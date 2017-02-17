
import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';


@Component({
    selector: 'rup-talla',
    templateUrl: 'talla.html'
})
export class TallaComponent {
    @Input('datosIngreso') datosIngreso: any;
    @Input('paciente') paciente: IPaciente;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('required') required: Boolean;

    @Output() evtData: EventEmitter<Number> = new EventEmitter<Number>();

    talla: Number = null;
    mensaje: String = null;
    edadEnMeses: Number = null;

    data: any = {
        valor: this.talla,
        mensaje: {
            texto: String,
        },
    };


    ngOnInit() {
        if (this.datosIngreso) {

            this.talla = this.datosIngreso[this.tipoPrestacion.key];
        }
    }

    devolverValores() {
        if (this.edadEnMeses >= 3 && this.edadEnMeses <= 9) {
            //6 meses
            if (this.talla < 63, 34) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 71, 9) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 9 && this.edadEnMeses <= 15) {
            //12 meses
            if (this.talla < 70, 99) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 80, 51) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 15 && this.edadEnMeses <= 21) {
            //18 meses
            if (this.talla < 76, 86) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 87, 66) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 21 && this.edadEnMeses <= 27) {
            //24 meses
            if (this.talla < 81, 7) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 93, 94) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 27 && this.edadEnMeses <= 33) {
            //30 meses
            if (this.talla < 85, 11) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 98, 75) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 33 && this.edadEnMeses <= 39) {
            //36 meses
            if (this.talla < 88, 66) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 103, 5) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 39 && this.edadEnMeses <= 45) {
            //42 meses
            if (this.talla < 91, 91) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 107, 79) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 45 && this.edadEnMeses <= 51) {
            //48 meses
            if (this.talla < 94, 95) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 111, 71) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 51 && this.edadEnMeses <= 57) {
            //54 meses
            if (this.talla < 97, 83) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 115, 51) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 57 && this.edadEnMeses <= 63) {
            //60 meses
            if (this.talla < 100, 72) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 119, 2) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 63 && this.edadEnMeses <= 69) {
            //66 meses
            if (this.talla < 103, 43) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 122, 39) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 69 && this.edadEnMeses <= 75) {
            //72 meses
            if (this.talla < 104, 48) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 123, 6) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 75 && this.edadEnMeses <= 81) {
            //78 meses
            if (this.talla < 107, 49) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 127, 1) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 87 && this.edadEnMeses <= 93) {
            //84 meses
            if (this.talla < 110, 2) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 130, 4) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 93 && this.edadEnMeses <= 99) {
            //90 meses
            if (this.talla < 112, 64) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 133, 56) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 99 && this.edadEnMeses <= 105) {
            //96 meses
            if (this.talla < 115, 1) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 136, 7) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 105 && this.edadEnMeses <= 111) {
            //102 meses
            if (this.talla < 117, 34) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 139, 66) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 111 && this.edadEnMeses <= 117) {
            //108 meses
            if (this.talla < 119, 6) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 142, 6) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 117 && this.edadEnMeses <= 123) {
            //114 meses
            if (this.talla < 121, 44) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 145, 56) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 123 && this.edadEnMeses <= 129) {
            //120 meses
            if (this.talla < 123, 3) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 148, 5) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 135 && this.edadEnMeses <= 141) {
            //126 meses
            if (this.talla < 125, 15) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 150, 95) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 141 && this.edadEnMeses <= 147) {
            //132 meses
            if (this.talla < 127) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 153, 4) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 147 && this.edadEnMeses <= 153) {
            //138 meses
            if (this.talla < 128, 9) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 156, 5) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 153 && this.edadEnMeses <= 159) {
            //144 meses
            if (this.talla < 130, 8) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 159, 6) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 159 && this.edadEnMeses <= 165) {
            //150 meses
            if (this.talla < 132, 19) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 164, 31) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 159 && this.edadEnMeses <= 165) {
            //156 meses
            if (this.talla < 133, 6) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 169) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 165 && this.edadEnMeses <= 171) {
            //162 meses
            if (this.talla < 137, 59) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 172, 31) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }
        if (this.edadEnMeses >= 171 && this.edadEnMeses <= 177) {
            //168 meses
            if (this.talla < 141, 6) { //p3
                this.mensaje = 'Baja estatura'
            }
            if (this.talla < 175, 6) { //p97
                this.mensaje = 'Demasiado alto'
            }
        }


        this.data.mensaje.texto = this.mensaje;
        this.data.valor = this.talla;
        this.evtData.emit(this.data);


    }


}