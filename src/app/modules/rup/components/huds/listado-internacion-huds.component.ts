
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
    selector: 'listado-internacion-huds',
    templateUrl: 'listado-internacion-huds.html'
})

export class ListadoInternacionHudsComponent implements OnInit {

    @Input() internaciones: any[];

    public internacione$: Observable<any>;


    public columns = [
        {
            key: 'organizacion',
            label: 'Organizacion',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.organizacion.nombre.localeCompare(b.organizacion.nombre)

        },
        {
            key: 'unidad_organizativa',
            label: 'Servicio',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const u1 = a.unidadOrganizativa?.term || '';
                const u2 = b.unidadOrganizativa?.term || '';
                return u1.localeCompare(u2);
            }
        },
        {
            key: 'fechaIngreso',
            label: 'Fecha Ingreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const fecha1 = moment(a.informeIngreso?.fechaIngreso);
                const fecha2 = moment(b.informeIngreso?.fechaIngreso);
                return fecha1.diff(fecha2);
            }
        },
        {
            key: 'fechaEgreso',
            label: 'Fecha Egreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const fecha1 = a.informeEgreso?.fechaEgreso || 0;
                const fecha2 = b.informeEgreso?.fechaEgreso || 0;
                return fecha1.getTime() - fecha2.getTime();
            }
        },
        {
            key: 'razon_alta',
            label: 'razon alta',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const r1 = a.informeEgreso?.tipoEgreso?.nombre || '';
                const r2 = b.informeEgreso?.tipoEgreso?.nombre || '';
                return r1.localeCompare(r2);
            }

        },
        {
            key: 'accion',
            label: 'accion',
            opcional: true
        },

    ];
    constructor(
        private router: Router
    ) {


    }

    ngOnInit() {
        // DEBUG: Ver la estructura completa de las internaciones
        console.log('=== DEBUG INTERNACIONES ===');
        console.log('Todas las internaciones:', this.internaciones);

        if (this.internaciones && this.internaciones.length > 0) {
            console.log('Primera internación completa:', this.internaciones[0]);
            console.log('Tiene ejecucion?:', this.internaciones[0].ejecucion);
            console.log('Tiene ejecucion.organizacion?:', this.internaciones[0].ejecucion?.organizacion);
            console.log('Tiene informeEstadistica?:', this.internaciones[0].informeEstadistica);
        }
        console.log('=========================');

        this.internacione$ = of(this.internaciones).pipe(
            map(prestaciones => {
                return prestaciones.sort((a, b) => {
                    const fecha1 = moment(a.informeIngreso?.fechaIngreso);
                    const fecha2 = moment(b.informeIngreso?.fechaIngreso);
                    return fecha2.diff(fecha1);
                });
            })
        );
    }

    gotoExploracionVisual(idInternacion) {
        this.router.navigate([`/mapa-camas/internacion/estadistica/resumen/${idInternacion}`]);

    }


}
