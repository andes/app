import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CARDS } from '../../enums';

@Component({
    selector: 'pdp-menu',
    templateUrl: './portal-menu.component.html'
})
export class PDPMenuComponent implements OnInit {
    public width = 0;
    public cards = CARDS;
    public inicio: boolean;
    public resizable = true;
    public expanded: Boolean = false;

    constructor(
        private el: ElementRef,
        private router: Router
    ) { }

    ngOnInit() {
        // oculta paciente detalle según ruteo
        this.inicio = this.router.url === '/mi-inicio';
    }

    goTo(path) {
        if (path) {
            this.router.navigate([path]);
        }
    }

    // Resize
    expandir() {
        this.expanded = !this.expanded;
    }
}
