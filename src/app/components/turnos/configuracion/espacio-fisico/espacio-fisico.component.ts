import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';

import { Auth } from '@andes/auth';

import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { Router } from '@angular/router';

@Component({
    selector: 'espacio-fisico',
    templateUrl: 'espacio-fisico.html'
})

export class EspacioFisicoComponent implements OnInit {
    public showEditar = false;
    public espaciosFisicos: IEspacioFisico[];
    public selectedEspacioFisico: IEspacioFisico;
    public filtros: any = {};
    public tengoDatos = true;
    public loader = false;

    constructor(private espacioFisicoService: EspacioFisicoService, private router: Router, public auth: Auth, public plex: Plex) {

    }

    ngOnInit() {
        // this.plex.updateTitle([{
        //     route: '/inicio',
        //     name: 'Citas'
        // }, {
        //     name: 'Espacios Físicos'
        // }]);
        // Verificamos permisos globales para espacios fisicos, si no posee realiza redirect al home
        if (!this.auth.check('turnos:editarEspacio') && !this.auth.check('turnos:*')) {
            this.router.navigate(['./inicio']);
        }
        this.loadEspaciosFisicos();
    }

    loadEspaciosFisicos(concatenar: boolean = false) {
        const parametros = {
            'descripcion': this.filtros && this.filtros.descripcion,
            'nombre': this.filtros && this.filtros.nombre,
            'edificio': this.filtros && this.filtros.edificio,
            'servicio': this.filtros && this.filtros.servicio,
            'sector': this.filtros && this.filtros.sector,
            'activo': this.filtros && this.filtros.activo,
            'organizacion': this.auth.organizacion.id
        };

        this.espacioFisicoService.get(parametros).subscribe(
            espaciosFisicos => {
                this.espaciosFisicos = espaciosFisicos;
            }); // Bind to view
    }

    onReturn(espacioFisico: IEspacioFisico): void {
        this.showEditar = false;
        this.selectedEspacioFisico = null;
        this.loadEspaciosFisicos();
    }


    activate(objEspacioFisico: IEspacioFisico) {

        if (objEspacioFisico.activo) {

            this.espacioFisicoService.disable(objEspacioFisico)
                .subscribe(datos => this.loadEspaciosFisicos()); // Bind to view
        } else {
            this.espacioFisicoService.enable(objEspacioFisico)
                .subscribe(datos => this.loadEspaciosFisicos()); // Bind to view
        }
    }

    editarEspacioFisico(espacioFisico: IEspacioFisico) {
        this.showEditar = true;
        this.selectedEspacioFisico = espacioFisico;
    }

    eliminarEspacioFisico(espacioFisico: IEspacioFisico) {
        this.plex.confirm(espacioFisico.nombre, '¿Eliminar espacio físico?').then(confirmacion => {
            if (confirmacion) {
                this.espacioFisicoService.delete(espacioFisico).subscribe(resultado => {
                    this.loadEspaciosFisicos();
                    this.plex.toast('info', espacioFisico.nombre, 'Espacio físico eliminado', 4000);
                });
            }
        });
    }

    routeMapa() {
        this.router.navigate(['./tm/mapa_espacio_fisico']);
    }

}
