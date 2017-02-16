import { IPaciente } from '../../interfaces/IPaciente';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'rup-peso',
    templateUrl: 'peso.html'
})
export class PesoComponent {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') prestacion: any;
    @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    peso: Number = null;
    mensaje: String = null;
    edadEnMeses: Number = null;
    

    data: any = {
        valor: this.peso,
        mensaje: {
            texto: String,
        },
    };

    ngOnInit() {
        if (this.datosIngreso) {
            this.peso = this.datosIngreso;
        }
    }

    devolverValores() {

        if (this.edadEnMeses >= 3 && this.edadEnMeses <= 9) {
            //6 meses
            if(this.peso < 6,27){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 9,75){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 9 && this.edadEnMeses <= 15) {
            //12 meses
            if(this.peso < 7,65){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 11,87){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 15 && this.edadEnMeses <= 21) {
            //18 meses
            if(this.peso < 8,64){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 13,5){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 21 && this.edadEnMeses <= 27) {
            //24 meses
            if(this.peso < 9,53){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 15,09){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 27 && this.edadEnMeses <= 33) {
            //30 meses
            if(this.peso < 10,34){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 16,64){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 33 && this.edadEnMeses <= 39) {
            //36 meses
            if(this.peso < 11,8){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 18,6){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 39 && this.edadEnMeses <= 45) {
            //42 meses
            if(this.peso < 11,79){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 19,43){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 45 && this.edadEnMeses <= 51) {
            //48 meses
            if(this.peso < 12,45){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 20,83){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 51 && this.edadEnMeses <= 57) {
            //54 meses
            if(this.peso < 13,11){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 22,27){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 57 && this.edadEnMeses <= 63) {
            //60 meses
            if(this.peso < 13,74){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 23,7){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 63 && this.edadEnMeses <= 69) {
            //66 meses
            if(this.peso < 15,33){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 26,7){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 69 && this.edadEnMeses <= 75) {
            //72 meses
            if(this.peso < 15,7){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 27,7){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 75 && this.edadEnMeses <= 81) {
            //78 meses
            if(this.peso < 16,53){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 29,49){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 87 && this.edadEnMeses <= 93) {
            //84 meses
            if(this.peso < 17,36){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 31,3){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 93 && this.edadEnMeses <= 99) {
            //90 meses
            if(this.peso < 18,38){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 33,44){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 99 && this.edadEnMeses <= 105) {
            //96 meses
            if(this.peso < 19,4){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 35,6){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 105 && this.edadEnMeses <= 111) {
            //102 meses
            if(this.peso < 20,45){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 37,83){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 111 && this.edadEnMeses <= 117) {
            //108 meses
            if(this.peso < 21,48){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 40,8){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 117 && this.edadEnMeses <= 123) {
            //114 meses
            if(this.peso < 22,5){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 42,54){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 123 && this.edadEnMeses <= 129) {
            //120 meses
            if(this.peso < 23,52){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 45){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 135 && this.edadEnMeses <= 141) {
            //126 meses
            if(this.peso < 24,49){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 47,77){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 141 && this.edadEnMeses <= 147) {
            //132 meses
            if(this.peso < 25,46){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 50,54){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 147 && this.edadEnMeses <= 153) {
            //138 meses
            if(this.peso < 26,54){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 54,36){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 153 && this.edadEnMeses <= 159) {
            //144 meses
            if(this.peso < 27,6){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 58,16){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 159 && this.edadEnMeses <= 165) {
            //150 meses
            if(this.peso < 28,91){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 61,83){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 159 && this.edadEnMeses <= 165) {
            //156 meses
            if(this.peso < 30,2){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 65,48){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 165 && this.edadEnMeses <= 171) {
            //162 meses
            if(this.peso < 31,59){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 70,13){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }
        if (this.edadEnMeses >= 171 && this.edadEnMeses <= 177) {
            //168 meses
            if(this.peso < 33){ //p3
                this.mensaje= 'Bajo Peso'
            }
            if(this.peso < 74,76){ //p97
                this.mensaje= 'Sobrepeso'
            }
        }


        this.data.mensaje.texto = this.mensaje;
        this.data.valor = this.peso;
        this.evtData.emit(this.data);





    }

}