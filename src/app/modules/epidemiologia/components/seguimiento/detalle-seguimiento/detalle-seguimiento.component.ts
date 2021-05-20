import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'detalle-seguimiento',
    templateUrl: './detalle-seguimiento.html',
})
export class DetalleSeguimientoComponent {
    @Input() seguimiento;
    @Output() returnDetalle: EventEmitter<any> = new EventEmitter<any>();
    @Output() verLlamado = new EventEmitter<any>();

    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];

    constructor(
        private router: Router
    ) { }

    public columns = [
        {
            key: 'fecha',
            label: 'Fecha/Hora',
        },
        {
            key: 'registro',
            label: 'Registro/Prestación'
        },
        {
            key: 'acciones',
            label: ''
        }
    ];

    cerrar() {
        this.returnDetalle.emit(false);
    }

    verPrestacion(prestacionId) {
        this.router.navigate(['/rup/validacion', prestacionId]);
    }

}
