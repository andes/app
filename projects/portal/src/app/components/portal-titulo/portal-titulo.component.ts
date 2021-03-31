import { Plex } from '@andes/plex';
import { Component, ElementRef } from '@angular/core';

@Component({
    selector: 'pdp-titulo',
    templateUrl: './portal-titulo.component.html'
})
export class PDPTituloComponent {
    public width = 0;

    constructor(
        private el: ElementRef,
        private plex: Plex,
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
