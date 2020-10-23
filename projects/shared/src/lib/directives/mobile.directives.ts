import { BreakpointObserver } from '@angular/cdk/layout';
import { Directive, TemplateRef, ViewContainerRef, OnDestroy, OnInit, Input, DebugElement, EmbeddedViewRef } from '@angular/core';
import { Subscription, merge, interval, NEVER } from 'rxjs';
import { filter } from 'rxjs/operators';


@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[mobile]'
})
export class MobileDirective<T> implements OnDestroy, OnInit {
    private openSubscription: Subscription;
    private viewRef: EmbeddedViewRef<any> = null;

    @Input() mobile = true;

    constructor(
        private view: ViewContainerRef,
        private nextRef: TemplateRef<ObserveContext<T>>,
        private breakpointObserver: BreakpointObserver
    ) { }


    ngOnDestroy() {
        this.openSubscription.unsubscribe();
    }

    ngOnInit() {
        if (this.mobile === null) {
            this.mobile = true;
        }
        const MOBILE_BREKPOINT = '(max-width: 599px)';
        this.openSubscription = this.breakpointObserver.observe(MOBILE_BREKPOINT).subscribe((states) => {
            if (states.breakpoints[MOBILE_BREKPOINT]) {
                if (this.mobile) {
                    this.createView();
                } else {
                    this.cleanView();
                }
            } else {
                if (!this.mobile) {
                    this.createView();
                } else {
                    this.cleanView();
                }
            }
        });
    }

    private createView() {
        if (!this.viewRef) {
            this.viewRef = this.view.createEmbeddedView(this.nextRef);
        }
    }

    private cleanView() {
        if (this.viewRef) {
            this.view.clear();
            this.viewRef.destroy();
            this.viewRef = null;
        }
    }

}

interface ObserveContext<T> {
    $implicit: T;
    observe: T;
}
