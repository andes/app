import { GrupoPoblacionalService } from './../../../services/grupo-poblacional.service';
import { Component, Input, OnInit } from '@angular/core';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';

@Component({
    selector: 'detalle-inscripcion',
    templateUrl: 'detalle-inscripcion.html'
})

export class DetalleInscripcionComponent implements OnInit {
    public _inscripcion: any;
    public gruposPoblacionales: any[];
    public profesionalCertificado: any;

    @Input()
    set inscripcion(value) {
        this._inscripcion = value;
        if (this._inscripcion.idPrestacionCertificado) {
            this.getProfesional(this._inscripcion.idPrestacionCertificado);
        }
    }
    get inscripcion() {
        return this._inscripcion;
    }

    constructor(
        private gruposService: GrupoPoblacionalService,
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
