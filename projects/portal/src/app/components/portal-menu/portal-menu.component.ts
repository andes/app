import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CARDS } from '../../enums';

@Component({
    selector: 'pdp-menu',
    templateUrl: './portal-menu.component.html'
})
export class PDPMenuComponent {
    public width = 0;
    public cards = CARDS;

    constructor(
        private el: ElementRef,
        private router: Router
    ) { }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 780;
    }

    goTo(path) {
        if (path) {
            this.router.navigate([path]);
        }
    }

}
