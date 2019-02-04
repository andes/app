import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-tension-arterial',
    templateUrl: '../core/rup.html'
})
@RupElement('TensionArterialComponent')
export class TensionArterialComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'peso' en otro elemento RUP

        // this.conceptObserverService.observe(this.registro).subscribe((data) => {
        //     // No soy yo mismo
        //     if (this.registro !== data && this.registro.valor !== data.valor) {
        //         this.registro.valor = data.valor;
        //         this.emitChange(false);
        //     }
        // });
    }
}
