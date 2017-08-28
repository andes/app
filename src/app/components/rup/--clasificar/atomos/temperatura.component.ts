import {
    Atomo
} from './../core/atomoComponent';
import {
    Component,
    Output,
    Input,
    EventEmitter,
    OnInit
} from '@angular/core';
@Component({
    selector: 'rup-temperatura',
    templateUrl: 'temperatura.html'
})
export class TemperaturaComponent extends Atomo {
    getMensajes() {
        let temperatura = this.data[this.elementoRUP.key];
        let mensaje: any = {
            texto: '',
            class: 'danger'
        };
        if (temperatura) {
            if (temperatura > 38) {
                mensaje.texto = 'Fiebre';
            } else {
                mensaje.texto = 'Normal';
            }
        }
        return mensaje;
    }
}
