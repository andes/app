import { Directive, Input, HostListener, Renderer, ElementRef } from '@angular/core';


@Directive({ selector: '[appHover]' })
export class HoverClassDirective {
    @Input() appHover: string;

    /**
     * Indica que estas clases no deben removerse porque ya estaban en el elemento antes de la ejecución de la directiva
     */
    private noQuitarClases = {};

    private hasClass(name) {
        // return this.elementRef.nativeElement.classList.indexOf(name) > -1;
        return (' ' + this.elementRef.nativeElement.className + ' ').indexOf(' ' + name + ' ') > -1;
    }

    constructor(public elementRef: ElementRef, private renderer: Renderer) { }

    @HostListener('mouseover') mouseover() {
        this.noQuitarClases = {};
        let list = this.appHover.split(' ');
        list.forEach((i) => {
            if (this.hasClass(i)) {
                this.noQuitarClases[i] = true;
            } else {
                this.renderer.setElementClass(this.elementRef.nativeElement, i, true);
            }
        });
    }

    @HostListener('mouseout') mouseout() {
        let list = this.appHover.split(' ');
        list.forEach((i) => {
            if (!this.noQuitarClases[i]) {
                this.renderer.setElementClass(this.elementRef.nativeElement, i, false);
            }
        });
    }
}
