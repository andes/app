import { Inject, Input, Output, EventEmitter, ElementRef, Component, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Component({
  selector: 'plex-scroll',
  template: '',
})
export class ScrollDirective {
  public _count: number;
  @Input('distancia') scrollTrigger: number;
  @Output('on-scroll') OnScrollMethod = new EventEmitter<any>();

  constructor(@Inject(DOCUMENT) private document: Document) {
    if (!this.scrollTrigger) {
      this.scrollTrigger = 1;
    }
  }

  @HostListener("window:scroll", [])
  onScroll() {
    this._count++;
    if (this.document.body.scrollTop + this.document.body.clientHeight >= this.document.body.scrollHeight) {
      this.OnScrollMethod.emit(null);
    } else {
      if (this._count % this.scrollTrigger === 0) {
        this.OnScrollMethod.emit(null);
      }
    }
  }
}
