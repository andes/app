import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-mapa-de-camas',
    templateUrl: './mapa-de-camas.component.html',
    styleUrls: ['./mapa-de-camas.component.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class MapaDeCamasComponent implements OnInit {

    public camas = [];

    constructor(private auth: Auth) { }

    ngOnInit() {
        // verificar permisos
        // buscar camas para la organización


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

            }
        ];
    }

}
