import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from '../common-novedades.service';

@Component({
    selector: 'catalogo-novedades',
    templateUrl: './catalogo-novedades.component.html',
})

export class CatalogoNovedadesComponent implements AfterViewInit, OnChanges {
    @Input() filtroFecha: Date;
    @Output() setFiltroFecha = new EventEmitter<Date>();

    public novedad = undefined;
    public novedades = [];
    public modulos = [];
    public catalogo = [];
    public moduloActivo = false;
    public fecha = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private commonNovedadesService: CommonNovedadesService,
    ) {
    }

    ngAfterViewInit(): void {
        this.initNovedades();

        this.route.params.subscribe(params => {
            this.novedad = params['novedad'];
        });
    }

    ngOnChanges(changes: any): void {
        if (changes.filtroFecha.currentValue) {
            this.fecha = moment(this.filtroFecha).format('DD/MM/YYYY');
            this.moduloActivo = false;
        } else {
            this.fecha = '';
        }
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
            this.modulos = { ...this.modulos, [modulo._id]: modulo };
        }

        this.modulos = Object.values(this.modulos).map(({ _id, nombre, descripcion }) => ({ _id, nombre, descripcion }));
    }

    private crearCatalogo(novedades: INovedad[]) {
        this.catalogo = [];

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

    public activarFiltroModulo(event: any) {
        this.moduloActivo = event;
    }

    public volver() {
        this.router.navigate(['/novedades'], { relativeTo: this.route });
    }

    public borrarFecha() {
        this.filtroFecha = null;
        this.setFiltroFecha.emit(null);
    }

    public verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
