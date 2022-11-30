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
        this.modulos = Object.values(this.listadoModulos).map(({ _id, nombre }) => ({ _id, nombre }));
        this.selectModulo = this.modulos[0];
    }

    public filtrarPorModulo() {
        this.filtroNovedades = this.novedades.filter((novedad) => novedad.modulo._id === this.selectModulo._id);
    }

    public verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
