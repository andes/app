import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@andes/auth';
import { Plex, SelectEvent } from '@andes/plex';

import { OrganizacionService } from '../../../services/organizacion.service';

@Component({
    selector: 'app-mapa-de-camas',
    templateUrl: './mapa-de-camas.component.html',
    styleUrls: ['./mapa-de-camas.component.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class MapaDeCamasComponent implements OnInit {

    // listado de camas de la organizacion
    public camas = [];
    // copia de las camas
    public camasCopy = [];

    // estado de las camas de la organizacion
    public estadoServicio: any = {};

    // filtros para el mapa de cama
    public filtros: any = {
        camas: null,
        habitacion: null,
        oxigeno: false,
        desinfectada: null,
        tipoCama: false,
        nombre: null,
        estado: null,
        servicio: null,
        sector: null,
        opciones: {
            sectores: [],
            habitaciones: [],
            estados: []
        }
    };

    constructor(private auth: Auth, private plex: Plex,
        private router: Router,
        private organizacionesService: OrganizacionService) { }

    ngOnInit() {
        // verificar permisos
        // buscar camas para la organización
        /* DECOMENTAR
        this.organizacionesService.getCamas(this.auth.organizacion.id).subscribe( camas => {
            this.camas = camas;

            this.organizacionesService.getEstadoServicio(camas).subscribe( estado = {
                this.estadoServicio = estado;
            });
            // creamos el estado del servicio. TODO: ¿verificar por servicio en el que está el profesional logueado?
            this.estadoServicio = this.getEstadoServicio(camas);
            // creamos copia para reestablecer luego de los filtros
            this.camasCopy = JSON.parse(JSON.stringify(this.camas));

            // seteamos las opciones para los filtros del mapa de camas
            this.setOpcionesFiltros();
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
                    'estado': 'ocupada'
                },
                'equipamiento': [],
                'tipoCama': {
                    'refsetIds': []
                },
                'servicio': {
                    'refsetIds': []
                },
                'id': '5a675108ff89743ab80d1484',
                'paciente': {
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

        this.organizacionesService.getEstadoServicio(this.camas).subscribe( estado => {
            this.estadoServicio = estado;
        });

        this.camasCopy = JSON.parse(JSON.stringify(this.camas));

        this.setOpcionesFiltros();
    }

    /**
     * Limpiamos los filtros del mapa de camas
     *
     * @memberof MapaDeCamasComponent
     */
    public limpiarFiltros() {
        this.filtros.habitacion = null;
        this.filtros.oxigeno = false;
        this.filtros.desinfectada = false;
        this.filtros.tipoCama = false;
        this.filtros.nombre = null;
        this.filtros.estado = null;
        this.filtros.servicio = null;
        this.filtros.sector = null;

        this.camas = this.camasCopy;
    }

    public setOpcionesFiltros() {
        if (!this.camas) {
            return;
        }

        // asignamos los sectores para los filtros
        this.camas.forEach(cama => {
            if (cama.sector && this.filtros.opciones.sectores.indexOf(cama.sector) === -1) {
                this.filtros.opciones.sectores.push({'id' : cama.sector, 'nombre': cama.sector});
            }

            if (cama.habitacion && this.filtros.opciones.habitaciones.indexOf(cama.habitacion) === -1) {
                this.filtros.opciones.habitaciones.push({'id' : cama.habitacion, 'nombre': cama.habitacion});
            }

            if (cama.ultimoEstado && this.filtros.opciones.estados.indexOf(cama.ultimoEstado.estado) === -1) {
                this.filtros.opciones.estados.push({'id' : cama.ultimoEstado.estado, 'nombre': cama.ultimoEstado.estado});
            }

            // TODO: Definir filtros para tipo de cama, oxigeno, etc.

            // ordenamos las opciones utilizando el desaconsejado metodo sort() :D
            if (this.filtros.opciones.sectores) { this.filtros.opciones.sectores.sort((a, b) => a.id - b.id); }
            if (this.filtros.opciones.habitaciones) { this.filtros.opciones.habitaciones.sort((a, b) => a.id - b.id); }
            if (this.filtros.opciones.estados) { this.filtros.opciones.estados.sort((a, b) => a.id - b.id); }
        });
    }

    public filtrar() {
        const regex_nombre = new RegExp('.*' + this.filtros.nombre + '.*', 'ig');

        let _desinfectada = (this.filtros.desinfectada) ? false : null;

        this.camas = this.camasCopy.filter( (i) => {

            return (
                // (!this.filtros.oxigeno || (this.filtros.oxigeno && i.oxigeno)) &&

                // (_desinfectada === null || (!_desinfectada && !i.desinfectada)) &&
                // (!this.filtros.tipoCama || (this.filtros.tipoCama && i.tipoCama === this.filtros.tipoCama)) &&
                (!this.filtros.habitacion || (this.filtros.habitacion && i.habitacion === this.filtros.habitacion.id)) &&
                (!this.filtros.estado || (this.filtros.estado && i.ultimoEstado.estado === this.filtros.estado.id)) &&
                (!this.filtros.sector || (this.filtros.sector && i.sector === this.filtros.sector.id)) &&
                (!this.filtros.servicio || !this.filtros.servicio.id || (this.filtros.servicio && i.servicio && i.servicio.id === this.filtros.servicio.id)) &&
                (!this.filtros.nombre || (this.filtros.nombre && i.paciente && (regex_nombre.test(i.paciente.nombre) || (regex_nombre.test(i.paciente.apellido)) || (regex_nombre.test(i.paciente.documento)))))

            );
        });
    }
}
