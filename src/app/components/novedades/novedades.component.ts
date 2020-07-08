import { Component, OnInit } from '@angular/core';
import { CommonNovedadesService } from './common-novedades.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'novedades',
    templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {

    constructor(
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        let modulo;
        this.route.params.subscribe(params => {
            modulo = params['modulo'];
            this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
                if (modulo) {
                    let novedadesFiltradas = novedades.filter(n => n.modulo && n.modulo._id === modulo);
                    this.commonNovedadesService.setNovedades(novedadesFiltradas);
                } else {
                    this.commonNovedadesService.setNovedades(novedades);
                }
            });
        });
    }
}
