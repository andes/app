import { Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, NavigationEnd, Event, Router, ActivationStart } from '@angular/router';
import { Observable, pipe, Subscription } from 'rxjs';
import { scan, filter, map } from 'rxjs/operators';
import { cache } from '../operators';

export function onRouterUpdate(events: Observable<Event>) {
    return pipe(
        scan((acc: any, e) => {
            if (e instanceof NavigationStart) {
                acc.stated = e.navigationTrigger;
                acc.ready = false;
            }
            if (e instanceof NavigationEnd) {
                acc.ready = true;
            }
            return acc;
        }, {}),
        filter((acc: any) => acc.ready),
        filter((acc: any) => acc.stated === 'popstate'),
        map(() => null)
    );
}

@Injectable()
export class RouterInspectService implements OnDestroy {

    routerChanges: Observable<any>;
    private subscription: Subscription;

    constructor(private router: Router) {

        this.routerChanges = this.router.events.pipe(
            scan((acc: any, e) => {
                if (e instanceof NavigationStart) {
                    acc.stated = e.navigationTrigger;
                    acc.params = {};
                    acc.ready = false;
                }
                if (e instanceof NavigationEnd) {
                    acc.ready = true;
                }
                if (e instanceof ActivationStart) {
                    acc.params = { ...acc.params, ...e.snapshot.params };
                }
                return acc;
            }, {}),
            filter((acc: any) => acc.ready),
            cache()
        );

        this.subscription = this.routerChanges.subscribe((dato) => {
            // Se subscribe para que empiece a funcionar
        });

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
