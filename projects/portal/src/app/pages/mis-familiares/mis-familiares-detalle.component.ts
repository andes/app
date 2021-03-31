import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'pdp-mis-familiares-detalle',
    templateUrl: './mis-familiares-detalle.component.html'
})
export class PDPMisFamiliaresDetalleComponent implements OnInit {

    constructor(
        private activeRoute: ActivatedRoute
    ) {

    }

    public miID = '';

    ngOnInit() {
        this.miID = this.activeRoute.snapshot.paramMap.get('id');
    }

}
