import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { VacunasService } from 'src/app/services/vacunas.service';
import { Plex } from '@andes/plex';
import { map } from 'rxjs/operators';

@Component({
    selector: 'lote-esquemas',
    templateUrl: 'lote-esquemas.html',
})

export class LoteEsquemasComponent implements OnInit {
    @Input() esquema: any;
    @Input() vacuna: any;
    public esquemas$: Observable<any>;
    public mostrarCondiciones = false;
    // public condicion;
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

    ngOnInit(): void {
        console.log(this.esquema);
    }

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
