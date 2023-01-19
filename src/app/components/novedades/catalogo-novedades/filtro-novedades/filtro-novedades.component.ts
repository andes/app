import { Component, EventEmitter, Input, Output } from '@angular/core';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';

@Component({
    selector: 'filtro-novedades',
    templateUrl: './filtro-novedades.component.html',
    styleUrls: ['./filtro-novedades.scss']
})

export class FiltroNovedadesComponent {
    @Input() novedades: any;
    @Input() modulos: any;
    @Input() ocultar: boolean;
    @Output() filtrarPorModulo = new EventEmitter<boolean>();
    @Output() verDetalle = new EventEmitter<any>();

    listadoModulos = [];
    selectModulo = null;
    filtroNovedades = null;

    filtrar() {
        this.filtrarPorModulo.emit(!!this.selectModulo?._id);
        this.filtroNovedades = this.novedades.filter((novedad: INovedad) => novedad.modulo?._id === this.selectModulo?._id);
    }

    verDetalleNovedad(novedad: INovedad) {
        this.verDetalle.emit(novedad);
    }
}
