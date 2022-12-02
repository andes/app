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
    public novedad = null;
    public novedades = [];
    public modulos = [];
    public catalogo = [];
    public filtroActivo = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private commonNovedadesService: CommonNovedadesService,
    ) {
    }

    ngOnInit(): void {
        this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
            this.novedades = novedades;
            this.crearModulos(novedades);
            this.crearCatalogo(novedades);
        });

        this.route.params.subscribe(params => {
            this.novedad = params['novedad'];
        });
    }

    private crearModulos(novedades: INovedad[]) {
        for (const { modulo } of novedades) {
            this.modulos = { ...this.modulos, [modulo._id]: modulo };
        }

        this.modulos = Object.values(this.modulos).map(({ _id, nombre, descripcion }) => ({ _id, nombre, descripcion }));
    }

    private crearCatalogo(novedades: INovedad[]) {
        for (const novedad of novedades) {
            const idModulo = novedad.modulo._id;
            const arregloNovedades = this.catalogo[idModulo] || [];

            arregloNovedades.push(novedad);

            this.catalogo = {
                ...this.catalogo,
                [idModulo]: arregloNovedades
            };
        }
    }

    public activarFiltros(event: boolean) {
        this.filtroActivo = event;
    }

    public volver() {
        this.router.navigate(['/novedades'], { relativeTo: this.route });
    }

    public verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
