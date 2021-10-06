
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'listado-internacion-huds',
    templateUrl: 'listado-internacion-huds.html'
})

export class ListadoInternacionHudsComponent implements OnInit {

    @Input() internaciones: any;

    public columns = [
        {
            key: 'organizacion',
            label: 'Organizacion',
            sorteable: true,
            opcional: true


        },
        {
            key: 'unidad_organizativa',
            label: 'Servicio',
            sorteable: true,
            opcional: true

        },
        {
            key: 'fechaIngreso',
            label: 'Fecha Ingreso',
            sorteable: true,
            opcional: true
        },
        {
            key: 'fechaEgreso',
            label: 'Fecha Egreso',
            sorteable: true,
            opcional: true
        },
        {
            key: 'razon_alta',
            label: 'razon alta',
            sorteable: true,
            opcional: true
        },
        {
            key: 'accion',
            label: 'accion',
            sorteable: true,
            opcional: true,
        },

    ];
    constructor(
        private router: Router
    ) {


    }

    ngOnInit() {
    }

    gotoExploracionVisual(idInternacion) {
        this.router.navigate([`/mapa-camas/internacion/estadistica/resumen/${idInternacion}`]);

    }


}
