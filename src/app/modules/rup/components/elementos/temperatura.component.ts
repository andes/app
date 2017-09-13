import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-temperatura',
    templateUrl: 'temperatura.html'
})
export class TemperaturaComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'temperatura' en otro elemento RUP
        // this.conceptObserverService.observe(this.registro).subscribe((data) => {
        //     // No soy yo mismo
        //     if (this.registro !== data && this.registro.valor !== data.valor) {
        //         this.registro.valor = data.valor;
        //         this.emitChange(false);
        //     }
        // });
    }


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
