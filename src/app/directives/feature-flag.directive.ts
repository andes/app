import { Auth } from '@andes/auth';
import { Directive, TemplateRef, ViewContainerRef, OnDestroy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { Subscription, merge, interval, NEVER } from 'rxjs';
import { filter } from 'rxjs/operators';


@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[feature]'
})
export class FeatureFlagDirective<T> implements OnDestroy, OnInit {
    private openSubscription: Subscription;
    private viewRef: any = null;

    /**
     * Nombre de la propiedad configurable en el usuario
     **/
    @Input() feature: string;

    constructor(
        private view: ViewContainerRef,
        private nextRef: TemplateRef<ObserveContext<T>>,
        private changes: ChangeDetectorRef,
        private auth: Auth
    ) { }


    ngOnDestroy() {
        this.openSubscription.unsubscribe();
    }

    ngOnInit() {
        this.openSubscription = this.auth.session().subscribe((sesion) => {
            if (sesion && sesion.feature && sesion.feature[this.feature]) {
                if (!this.viewRef) {
                    this.viewRef = this.view.createEmbeddedView(this.nextRef);
                    this.changes.markForCheck();
                }
            }
        });
    }

}

interface ObserveContext<T> {
    $implicit: T;
    observe: T;
}
