import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';
import { CommonNovedadesService } from '../common-novedades.service';

@Component({
    selector: 'catalogo-novedades',
    templateUrl: './catalogo-novedades.component.html',
})

export class CatalogoNovedadesComponent implements OnInit, OnChanges {
    @Input() fecha: string;
    @Input() novedad: INovedad;
    @Output() volver = new EventEmitter<any>();
    @Output() setNovedad = new EventEmitter<any>();

    novedades = [];
    modulos = [];
    catalogo = [];
    filtroModulo = false;
    fechaConFormato = '';

    constructor(
        private commonNovedadesService: CommonNovedadesService,
    ) {
    }

    ngOnInit(): void {
        this.initNovedades();
    }

    ngOnChanges(changes: any): void {
        this.fechaConFormato = moment(changes.fecha.currentValue).format('DD/MM/YYYY');
        this.initNovedades();
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

    filtrar(filtroModulo: boolean) {
        this.filtroModulo = filtroModulo;
    }

    verDetalle(novedad: INovedad) {
        this.setNovedad.emit(novedad);
    }

    volverInicio() {
        this.volver.emit();
    }
}
