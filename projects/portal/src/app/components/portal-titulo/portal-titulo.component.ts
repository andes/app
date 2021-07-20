import { Component, ElementRef } from '@angular/core';
import { CARDS } from '../../enums';

@Component({
    selector: 'pdp-titulo',
    templateUrl: './portal-titulo.component.html'
})
export class PDPTituloComponent {
    public width: number;
    public cards = CARDS;

    constructor(
        private el: ElementRef
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
