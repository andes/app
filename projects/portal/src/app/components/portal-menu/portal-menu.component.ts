import { Component, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'pdp-menu',
    templateUrl: './portal-menu.component.html'
})
export class PDPMenuComponent {
    public width = 0;

    constructor(
        private el: ElementRef,
        private router: Router,
        private activeRoute: ActivatedRoute
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    cards = [
        {
            id: 10,
            nombre: 'relaciones',
            tipo: 'info',
            semanticTag: 'solicitud',
            icono: 'familia',
            path: 'mis-familiares',
            color: '#0070cc',
            outlet: 'listado'
        }, {
            id: 12,
            nombre: 'turnos',
            tipo: 'info',
            semanticTag: 'solicitud',
            icono: 'turno-bold',
            path: 'mis-turnos',
            color: '#0070cc',
            outlet: 'listado',
        },
        {
            id: 13,
            nombre: 'certificados',
            tipo: 'info',
            semanticTag: 'elementos de registro',
            icono: 'documentos',
            path: 'mis-certificados',
            color: '#0070cc',
            outlet: 'listado',
        }];

    goTo(path) {
        this.router.navigate([path]);
    }

}
