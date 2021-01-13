import { Auth } from '@andes/auth';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';

@Component({
    selector: 'in-ingreso-dinamico',
    templateUrl: './ingreso-dinamico.component.html'
})
export class IngresoDinamicoComponent implements OnChanges {

    @Input() resumen: any;


    public prestacion = null;

    constructor(
        public elementosRUPService: ElementosRUPService,
        public auth: Auth
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.resumen) {

            this.prestacion = {
                paciente: this.resumen.paciente,
                solicitud: {
                    tipoPrestacion: {},
                    organizacion: { ...this.auth.organizacion },
                    profesional: {}
                },
                ejecucion: {
                    organizacion: { ...this.auth.organizacion },
                    registros: this.resumen.ingreso.registros,

                }
            };

        }
    }

}
