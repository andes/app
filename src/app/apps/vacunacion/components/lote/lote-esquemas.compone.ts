import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { VacunasService } from 'src/app/services/vacunas.service';

@Component({
    selector: 'lote-esquemas',
    templateUrl: 'lote-esquemas.html',
})

export class LoteEsquemasComponent {
    @Input() esquema: any;
    @Input() vacuna: any;
    public esquemas$: Observable<any>;
    public mostrarCondiciones = false;
    public columnasCondiciones = [
        {
            key: 'codigo',
            label: 'Codigo'
        },
        {
            key: 'nombre',
            label: 'Nombre'
        },
    ];
    constructor(
        private vacunasService: VacunasService,
    ) { }

    cargarCondiciones(codigo, nombre) {
        this.esquemas$ = this.vacunasService.getNomivacEsquemas({
            habilitado: true,
            vacuna: this.vacuna._id,
            codigo: codigo,
            nombre: nombre,
            sort: 'codigo'
        });
        this.mostrarCondiciones = true;
    }

    cerrarCondicion() {
        this.mostrarCondiciones = false;
    }
}
