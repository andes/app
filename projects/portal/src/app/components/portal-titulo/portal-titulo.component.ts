import { Component, ElementRef } from '@angular/core';

@Component({
    selector: 'pdp-titulo',
    templateUrl: './portal-titulo.component.html'
})
export class PDPTituloComponent {
    public width = 0;

    constructor(
        private el: ElementRef
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
