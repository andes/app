import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-mapa-de-camas',
    templateUrl: './mapa-de-camas.component.html',
    styleUrls: ['./mapa-de-camas.component.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class MapaDeCamasComponent implements OnInit {

    public camas = [];
    public estadoServicio;

    constructor(private auth: Auth, private plex: Plex,
        private router: Router) { }

    ngOnInit() {
        // verificar permisos
        // buscar camas para la organización
        /* DECOMENTAR
        this.organizacionesService.getCamas(this.auth.organizacion.id).subscribe( camas => {
            this.camas = camas;

            this.estadoServicio = this.getEstadoServicio(camas);
        }, (err) => {
            if (err) {
                this.plex.info('danger', err, 'Error');
                this.router.navigate(['/']);
            }
        });
        */
        /* borrar este */
        this.camas = [
            {
                '_id': '5a67166a732831242c94336b',
                'sector': 44,
                'habitacion': 45,
                'numero': 44,
                'ultimoEstado': {
                    'estado': 'desocupada'
                },
                'equipamiento': [],
                'tipoCama': {
                    'refsetIds': []
                },
                'servicio': {
                    'refsetIds': []
                },
                'id': '5a67166a732831242c94336b'
            },
            {
                'numero': 44,
                'habitacion': 44,
                'sector': 44,
                '_id': '5a672e92cd3d664344180b3b',
                'ultimoEstado': {
                    'estado': 'bloqueada'
                },
                'equipamiento': [],
                'tipoCama': {
                    'refsetIds': []
                },
                'servicio': {
                    'refsetIds': []
                },
                'id': '5a672e92cd3d664344180b3b'
            },
            {
                'sector': 89,
                'habitacion': 89,
                'numero': 89,
                '_id': '5a67508fff89743ab80d13f8',
                'ultimoEstado': {
                    'estado': 'reparacion'
                },
                'equipamiento': [],
                'tipoCama': {
                    'refsetIds': []
                },
                'servicio': {
                    'refsetIds': []
                },
                'id': '5a67508fff89743ab80d13f8'
            },
            {
                'sector': 99,
                'habitacion': 99,
                'numero': 99,
                '_id': '5a675108ff89743ab80d1484',
                'ultimoEstado': {
                    'estado': 'desocupada'
                },
                'equipamiento': [],
                'tipoCama': {
                    'refsetIds': []
                },
                'servicio': {
                    'refsetIds': []
                },
                'id': '5a675108ff89743ab80d1484',
                'paciente':  {
                    'id': '5a675108ff89743ab80d1455',
                    'nombre': 'Manuel',
                    'apellido': 'Urbano Stordeur',
                    'documento': '31965283',
                    'telefono': '2994185878',
                    'sexo': 'masculino',
                    'fechaNacimiento': new Date(1986, 4, 23, 10, 50, 0).toISOString()
                }

            },
            {
                '_id': '5a67166a732831242c94336b',
                'sector': 1,
                'habitacion': 525,
                'numero': 1,
                'ultimoEstado': {
                    'estado': 'desocupada'
                },
                'equipamiento': [],
                'tipoCama': {
                    'refsetIds': []
                },
                'servicio': {
                    'refsetIds': []
                },
                'id': '5a67166a732831242c94336b'
            }

        ];

        this.estadoServicio = this.getEstadoServicio(this.camas);
    }

    public getEstadoServicio(camas) {
        const ocupadas = camas.filter(function(i){
            return (i.ultimoEstado.estado === 'ocupada');
        });

        // ocupacion
        const bloqueadas = camas.filter(function(i){
            return (i.ultimoEstado.estado === 'bloqueada');
        });

        const descontaminacion = camas.filter(function(i){
            return (i.ultimoEstado.estado === 'desocupada' && !i.desinfectada);
        });

        const reparacion = camas.filter(function(i){
            return (i.ultimoEstado.estado === 'reparacion');
        });

        // disponibles
        const desocupadas = camas.filter(function(i){
            return (i.ultimoEstado.estado === 'desocupada');
        });

        const desocupadasOxigeno = camas.filter(function(i){
            return (i.ultimoEstado.estado === 'desocupada' && i.oxigeno);
        });

        return {
            'total' : camas.length,
            'ocupadas' : ocupadas.length,
            'desocupadas' : desocupadas.length,
            'descontaminacion' : descontaminacion.length,
            'reparacion' : reparacion.length,
            'bloqueadas' : bloqueadas.length,
            'desocupadasOxigeno' : desocupadasOxigeno.length
        };
    }
}
