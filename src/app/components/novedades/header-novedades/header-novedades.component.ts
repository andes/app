import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CommonNovedadesService } from '../common-novedades.service';
import { INovedad } from '../../../interfaces/novedades/INovedad.interface';

@Component({
    selector: 'header-novedades',
    templateUrl: './header-novedades.component.html',
    styles: [`
        .item-default-img {
            align-self: center;
            border-radius: 50%;
            -o-object-fit: cover;
            object-fit: cover;
            width: 3rem;
            height: 3rem;
        }
    `]
})

export class HeaderNovedadesComponent implements OnInit {

    public novedades$;
    selectedId: number;

    constructor(
        private router: Router,
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
            this.novedades$ = novedades;
        });
    }

    public getFoto(novedad: any) {
        let imagenes = novedad.imagenes ? novedad.imagenes : [];
        if (imagenes.length > 0) {
            return this.createUrl(imagenes[0]);
        } else {
            return null;
        }
    }

    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/registro-novedades/store/' + doc.id;
        }
    }

    public onSelectedNovedadChange(novedad: INovedad) {
        this.router.navigate(['/novedades/ver', novedad._id], { relativeTo: this.route });
    }
}
