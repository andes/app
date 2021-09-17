import { GrupoPoblacionalService } from './../../../services/grupo-poblacional.service';
import { Component, Input, OnInit } from '@angular/core';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';

@Component({
    selector: 'detalle-inscripcion',
    templateUrl: 'detalle-inscripcion.html'
})

export class DetalleInscripcionComponent implements OnInit {
    public inscripcion: any;
    public gruposPoblacionales: any[];
    public profesionalCertificado: any;

    @Input('inscripcion')
    set _inscripcion(value) {
        this.inscripcion = value;
        if (this.inscripcion.idPrestacionCertificado) {
            this.getProfesional(this.inscripcion.idPrestacionCertificado);
        }
    }

    constructor(private gruposService: GrupoPoblacionalService,
                public servicioPrestacion: PrestacionesService) { }

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

    getProfesional(idPrestacionCertificado: string) {
        this.servicioPrestacion.getById(idPrestacionCertificado).subscribe(prestacion => {
            this.profesionalCertificado = prestacion.createdBy;
        });
    }

}
