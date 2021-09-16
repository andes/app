import { Auth } from '@andes/auth';
import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { OrganizacionService } from '../services/organizacion.service';


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
        private auth: Auth,
        private organizacionService: OrganizacionService
    ) { }


    ngOnDestroy() {
        this.openSubscription.unsubscribe();
    }

    ngOnInit() {
        this.openSubscription = combineLatest([
            this.auth.session(),
            this.organizacionService.configuracion(this.auth.organizacion.id)
        ]).subscribe(([sesion, configuracion]) => {
            const flagSession = sesion && sesion.feature && sesion.feature[this.feature];
            const flagOrganizacion = configuracion && configuracion[this.feature];
            if (flagSession || flagOrganizacion) {
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
