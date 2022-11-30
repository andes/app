import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from '../common-novedades.service';

@Component({
    selector: 'catalogo-novedades',
    templateUrl: './catalogo-novedades.component.html',
    styleUrls: ['catalogo-novedades.scss']
})

export class CatalogoNovedadesComponent implements OnInit {
    public novedades = [];
    public modulos = [];
    public listadoModulos = [];
    public novedad = null;
    public selectModulo = null;
    public filtroNovedades = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private commonNovedadesService: CommonNovedadesService,
    ) {
    }

    ngOnInit(): void {
        this.commonNovedadesService.getNovedades().subscribe((novedades) => { this.crearCatalogo(novedades); this.filtrarPorModulo(); });

        this.route.params.subscribe(params => {
            this.novedad = params['novedad'];
        });
    }

    private crearCatalogo(novedades: INovedad[]) {
        for (const { modulo } of novedades) {
            this.listadoModulos = { ...this.listadoModulos, [modulo._id]: modulo };
        }

        this.novedades = novedades;
<<<<<<< HEAD
        this.modulos = Object.values(this.listadoModulos).map(({ _id, nombre, descripcion }) => ({ _id, nombre, descripcion }));
=======
        this.modulos = Object.values(this.listadoModulos).map(({ _id, nombre }) => ({ _id, nombre }));
>>>>>>> 7f676c4c7300a7bcfbd523bc0e9d8aacb1fd1d57
        this.selectModulo = this.modulos[0];
    }

    public filtrarPorModulo() {
        this.filtroNovedades = this.novedades.filter((novedad) => novedad.modulo._id === this.selectModulo._id);
    }

    public verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
<<<<<<< HEAD

    public volver() {
        this.router.navigate(['/novedades'], { relativeTo: this.route });
    }
=======
>>>>>>> 7f676c4c7300a7bcfbd523bc0e9d8aacb1fd1d57
}
