import { Plex } from '@andes/plex';
import { Component, ElementRef } from '@angular/core';

@Component({
    selector: 'pdp-menu',
    templateUrl: './portal-menu.component.html'
})
export class PDPMenuComponent {
    public width = 0;

    constructor(
        private el: ElementRef,
        private plex: Plex,
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    public cards = [
        {
            id: 10,
            nombre: 'relaciones',
            tipo: 'info',
            semanticTag: 'solicitud',
            icono: 'familia',
            path: 'misFamiliares',
            color: '#0070cc',
            outlet: 'listado'
        }
    ];

}
