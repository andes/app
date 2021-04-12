import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'pdp-menu',
    templateUrl: './portal-menu.component.html'
})
export class PDPMenuComponent {
    public width = 0;

    constructor(
        private el: ElementRef,
        private router: Router
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    cards = [{
        id: 12,
        nombre: 'turnos',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'turno-bold',
        path: 'mis-turnos',
        color: '#0070cc',
        outlet: 'listado',
    }];

    goTo(path) {
        this.router.navigate([path]);
    }

}
