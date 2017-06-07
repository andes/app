import { Directive, Input, HostListener, Renderer, ElementRef } from '@angular/core';


@Directive({ selector: '[appHover]' })
export class HoverClassDirective {
    @Input() appHover: string;

    constructor(public elementRef: ElementRef, private renderer: Renderer) { }

    @HostListener('mouseover') mouseover() {
        let list = this.appHover.split(' ');
        list.forEach((i) => this.renderer.setElementClass(this.elementRef.nativeElement, i, true));
    }

    @HostListener('mouseout') mouseout() {
        let list = this.appHover.split(' ');
        list.forEach((i) => this.renderer.setElementClass(this.elementRef.nativeElement, i, false));
    }
}
