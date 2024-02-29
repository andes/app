import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';
import { ModulosService } from '../../../services/novedades/modulos.service';
import { NovedadesService } from 'src/app/services/novedades/novedades.service';
import { IModulo } from 'src/app/interfaces/novedades/IModulo.interface';

@Component({
    selector: 'catalogo-novedades',
    styleUrls: ['./filtro-novedades.scss'],
    templateUrl: './catalogo-novedades.component.html',
})

export class CatalogoNovedadesComponent implements OnInit, OnChanges {
    @Input() fecha: string;
    @Input() novedad: INovedad;
    @Input() modulo: String;
    @Output() volver = new EventEmitter<any>();
    @Output() setNovedad = new EventEmitter<any>();

    novedades = [];
    modulos = [];
    catalogo = [];
    modulosCatalogo: IModulo[] = [];
    filtroModulo = false;
    fechaConFormato = '';
    selectModulo = null;
    fechaDesde: Date = null;
    fechaHasta: Date = null;

    constructor(
        private novedadesService: NovedadesService,
        private modulosService: ModulosService,
    ) {
    }

    ngOnInit(): void {
        this.crearModulos();
        this.filtrar();

    }

    ngOnChanges(changes: any): void {
        this.filtrar();
    }


    private crearModulos() {
        this.modulosService.search({ activo: true }).subscribe(modulos => {
            this.modulos = modulos
                .filter(m => { if (this.modulosService.controlarPermisos(m)) { return m; } })
                .sort((a, b) => (a.nombre > b.nombre) ? 1 : ((b.nombre > a.nombre) ? -1 : 0));
            if (this.modulo) {
                this.selectModulo = this.modulos.find(m => m._id === this.modulo);
            }
        });

    }

    private crearCatalogo() {
        this.catalogo = [];
        this.modulosCatalogo = [];
        for (const novedad of this.novedades) {
            const idModulo = novedad.modulo?._id;
            const arregloNovedades = this.catalogo[idModulo] || [];
            const mod = this.modulosCatalogo.find(modulo => modulo._id === novedad.modulo._id);
            if (!mod) {
                this.modulosCatalogo.push(novedad.modulo);
            }

            arregloNovedades.push(novedad);

            this.catalogo = {
                ...this.catalogo,
                [idModulo]: arregloNovedades
            };
        }
    }

    filtrar() {
        this.novedadesService.search({ activa: true }).subscribe(novedades => {
            if (this.fechaDesde) {
                novedades = novedades.filter((novedad: INovedad) => novedad.fecha >= this.fechaDesde);
            }
            if (this.fechaHasta) {
                novedades = novedades.filter((novedad: INovedad) => novedad.fecha <= this.fechaDesde);
            }
            if (this.selectModulo) {
                novedades = novedades.filter((novedad: INovedad) => novedad.modulo._id === this.selectModulo._id);
            }
            this.novedades = novedades;
            this.crearCatalogo();
        });
    }

    verDetalle(novedad: INovedad) {
        this.setNovedad.emit(novedad);
    }

    volverInicio() {
        this.volver.emit();
    }
}
