import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';

@Component({
    selector: 'app-ingreso-detalle',
    templateUrl: './ingreso-detalle.component.html',
})

export class IngresoDetalleComponent implements OnInit {
    // EVENTOS
    @Input() prestacion;
    @Input() informeIngreso;

    // VARIABLES
    public fechaIngreso;
    public paciente;

    constructor(
        public auth: Auth,
    ) { }

    ngOnInit() {
        this.paciente = this.prestacion.paciente;
        this.fechaIngreso = this.informeIngreso.fechaIngreso;
    }
}
