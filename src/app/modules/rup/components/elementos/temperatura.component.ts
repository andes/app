import {    Component,    Output,    Input,    EventEmitter,    OnInit} from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-temperatura',
    templateUrl: 'temperatura.html'
})
export class TemperaturaComponent extends RUPComponent {
    // getMensajes() {
    //     let temperatura = this.data[this.elementoRUP.key];
    //     let mensaje: any = {
    //         texto: '',
    //         class: 'danger'
    //     };
    //     if (temperatura) {
    //         if (temperatura > 38) {
    //             mensaje.texto = 'Fiebre';
    //         } else {
    //             mensaje.texto = 'Normal';
    //         }
    //     }
    //     return mensaje;
    // }
}
