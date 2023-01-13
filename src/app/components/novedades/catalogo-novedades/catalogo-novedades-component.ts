import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from '../common-novedades.service';

@Component({
    selector: 'catalogo-novedades',
    templateUrl: './catalogo-novedades.component.html',
})

export class CatalogoNovedadesComponent implements OnInit, OnChanges {
    @Input() fecha: string;

    public novedad = undefined;
    public novedades = [];
    public modulos = [];
    public catalogo = [];
    public filtroModulo = false;
    public fechaConFormato = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private commonNovedadesService: CommonNovedadesService,
    ) {
    }

    ngOnInit(): void {
        this.initNovedades();

        this.route.params.subscribe(params => {
            this.novedad = params['novedad'];
        });
    }

    ngOnChanges(changes: any): void {
        this.fechaConFormato = moment(changes.fecha.currentValue).format('DD/MM/YYYY');
    }

    private initNovedades() {
        this.commonNovedadesService.getNovedades().subscribe((novedades) => {
            this.novedades = novedades;
            this.crearModulos(novedades);
            this.crearCatalogo(novedades);
        });
    }

    private crearModulos(novedades: INovedad[]) {
        this.modulos = [];

        for (const { modulo } of novedades) {
            if (modulo?._id) {
                this.modulos = { ...this.modulos, [modulo._id]: modulo };
            }
        }

        this.modulos = Object.values(this.modulos).map(({ _id, nombre, descripcion, color }) => ({ _id, nombre, descripcion, color }));
    }

    private crearCatalogo(novedades: INovedad[]) {
        this.catalogo = [];

        for (const novedad of novedades) {
            const idModulo = novedad.modulo?._id;
            const arregloNovedades = this.catalogo[idModulo] || [];

            arregloNovedades.push(novedad);

            this.catalogo = {
                ...this.catalogo,
                [idModulo]: arregloNovedades
            };
        }
    }

    public filtrar(id: string) {
        this.filtroModulo = !!id;
    }

    public volver() {
        this.router.navigate(['/novedades'], { relativeTo: this.route });
    }

    public verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
