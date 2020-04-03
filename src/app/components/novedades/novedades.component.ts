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
        private route: ActivatedRoute,
        private router: Router) {
    }

    ngOnInit() {
        let modulo;
        this.route.params.subscribe(params => {
            modulo = params['modulo'];
        });
        if (modulo) {
            this.commonNovedadesService.setNovedades(modulo);
        } else {
            this.commonNovedadesService.setNovedades();
        }
    }
}
