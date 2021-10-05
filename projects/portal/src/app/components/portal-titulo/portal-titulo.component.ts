import { Component, ElementRef } from '@angular/core';
import { CARDS } from '../../enums';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'pdp-titulo',
    templateUrl: './portal-titulo.component.html'
})
export class PDPTituloComponent {
    public width: number;
    public cards = CARDS;
    public searchInput = false;
    public searchTerm = new BehaviorSubject<string>('');

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

    showSearch() {
        this.searchInput = !this.searchInput;
    }
}
