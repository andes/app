import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-ingresoInternacion',
    templateUrl: 'ingresoInternacion.html'
})
export class IngresoInternacionComponent extends RUPComponent implements OnInit {
    public ocupaciones = [];
    public obrasSociales = [];
    public origenHospitalizacion = [{ id: 'ambulatorio', nombre: 'Ambulatorio' },
    { id: 'emergencia', nombre: 'Emergencia' }, { id: 'consultorio externo', nombre: 'Consultorio externo' },
    { id: 'ambulatorio', nombre: 'ambulatorio' }];

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                InformeIngreso: {}
            };
        }

        // Cargamos todas las ocupaciones
        this.ocupacionService.get().subscribe(rta => {
            this.ocupaciones = rta;
        });

        // Se cargan los combos
        this.financiadorService.get().subscribe(resultado => {
            this.obrasSociales = resultado;
        });

    }
}
