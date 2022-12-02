import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INovedad } from 'src/app/interfaces/novedades/INovedad.interface';

@Component({
    selector: 'filtro-novedades',
    templateUrl: './filtro-novedades.component.html',
    styleUrls: ['./filtro-novedades.scss']
})

export class FiltroNovedadesComponent implements OnInit {
    @Input() novedades: any;
    @Input() modulos: any;
    @Input() ocultar: boolean;
    @Output() filtroActivo = new EventEmitter<boolean>();

    public listadoModulos = [];
    public selectModulo = null;
    public filtroNovedades = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.filtroActivo.emit(false);
    }

    public filtrarPorModulo() {
        this.filtroActivo.emit(!!(this.selectModulo?._id));
        this.filtroNovedades = this.novedades.filter((novedad) => novedad.modulo._id === this.selectModulo?._id);
    }

    public verDetalleNovedad(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
