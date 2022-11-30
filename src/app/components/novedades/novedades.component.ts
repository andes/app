import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonNovedadesService } from './common-novedades.service';

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
                this.commonNovedadesService.setNovedades(novedades);
            });
        });
    }
}
