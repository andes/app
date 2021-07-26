import { Component, ElementRef } from '@angular/core';
import { CARDS } from '../../enums';
import { Router } from '@angular/router';

@Component({
    selector: 'pdp-titulo',
    templateUrl: './portal-titulo.component.html'
})
export class PDPTituloComponent {
    public width: number;
    public cards = CARDS;

    constructor(
        private el: ElementRef,
        private router: Router
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    goTo(path: string) {
        this.router.navigate([path]);
    }
}
