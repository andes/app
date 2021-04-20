import { GrupoPoblacionalService } from './../../../services/grupo-poblacional.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'detalle-inscripcion',
    templateUrl: 'detalle-inscripcion.html'
})

export class DetalleInscripcionComponent implements OnInit {
    public inscripcion: any;
    public gruposPoblacionales: any[];

    @Input('inscripcion')
    set _inscripcion(value) {
        this.inscripcion = value;
    }

    constructor(private gruposService: GrupoPoblacionalService) { }

    ngOnInit() {
        this.gruposService.search().subscribe(resp => {
            this.gruposPoblacionales = resp;
        });
    }


    grupoPoblacional(nombre: string) {
        let descripcion;
        if (this.gruposPoblacionales) {
            descripcion = this.gruposPoblacionales.find(item => item.nombre === nombre).descripcion;
        }
        return descripcion;
    }

}
