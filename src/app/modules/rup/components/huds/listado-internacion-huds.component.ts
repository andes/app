
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
            sort: (a: any, b: any) => a.ejecucion.organizacion.nombre.localeCompare(b.ejecucion.organizacion.nombre)

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
                const fecha1 = moment(a.ejecucion.registros[0].valor.informeIngreso.fechaIngreso);
                const fecha2 = moment(b.ejecucion.registros[0].valor.informeIngreso.fechaIngreso);
                return fecha1.diff(fecha2);
            }
        },
        {
            key: 'fechaEgreso',
            label: 'Fecha Egreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const fecha1 = moment(a.ejecucion.registros[1].valor.informeEgreso.fechaEgreso) || '';
                const fecha2 = moment(b.ejecucion.registros[1].valor.informeEgreso.fechaEgreso) || '';
                return fecha1.diff(fecha2);
            }
        },
        {
            key: 'razon_alta',
            label: 'razon alta',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const r1 = a.ejecucion.registros[1]?.valor.InformeEgreso.tipoEgreso.nombre || '';
                const r2 = b.ejecucion.registros[1]?.valor.InformeEgreso.tipoEgreso.nombre || '';
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
        this.internacione$ = of(this.internaciones).pipe(
            map(prestaciones => {
                return prestaciones.sort((a, b) => {
                    const fecha1 = moment(a.ejecucion.registros[0].valor.informeIngreso.fechaIngreso);
                    const fecha2 = moment(b.ejecucion.registros[0].valor.informeIngreso.fechaIngreso);
                    return fecha2.diff(fecha1);
                });
            })
        );
    }

    gotoExploracionVisual(idInternacion) {
        this.router.navigate([`/mapa-camas/internacion/estadistica/resumen/${idInternacion}`]);

    }


}
