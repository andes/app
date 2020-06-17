import { Inject, Injectable, Optional } from '@angular/core';
import { Auth } from '@andes/auth';
import { environment } from '../../../environments/environment';
import { Router, NavigationEnd } from '@angular/router';

/**
 * Referencia:
 * https://github.com/mzuccaroli/angular-google-tag-manager/blob/master/projects/angular-google-tag-manager/src/lib/angular-google-tag-manager.service.ts<
 */

@Injectable({
    providedIn: 'root'
})
export class GoogleTagManagerService {
    private gtmId: string;
    private loaded = false;

    private browserGlobals = {
        windowRef(): any {
            return window;
        },
        documentRef(): any {
            return document;
        }
    };

    constructor(
        private auth: Auth,
        private router: Router,
    ) {
        this.gtmId = environment.ANALYTICS_KEY;

        this.auth.session().subscribe((sesion) => {
            if (sesion && sesion.feature && sesion.feature.analytics) {
                this.addGtmToDom();
            }
        });

    }

    public getDataLayer() {
        const window = this.browserGlobals.windowRef();
        window['dataLayer'] = window['dataLayer'] || [];
        window.gtag = function () { window['dataLayer'].push(arguments); };
        return window['dataLayer'];
    }

    public addGtmToDom() {
        if (this.loaded) { return; }
        const doc = this.browserGlobals.documentRef();

        const window = this.browserGlobals.windowRef();

        const gtmScript = doc.createElement('script');
        gtmScript.id = 'GTMscript';
        gtmScript.async = true;
        gtmScript.src = this.applyGtmQueryParams(
            'https://www.googletagmanager.com/gtag/js'
        );
        doc.head.insertBefore(gtmScript, doc.head.firstChild);
        this.getDataLayer();

        window.gtag('js', new Date());
        window.gtag('config', this.gtmId);

        this.router.events.forEach(item => {
            if (item instanceof NavigationEnd) {
                const gtmTag = {
                    page_title: item.urlAfterRedirects,
                    page_path: item.urlAfterRedirects
                };
                window.gtag('config', this.gtmId, gtmTag);
            }
        });

        this.loaded = true;
    }

    public event(action: string, category: string, label: string, value: number) {
        const window = this.browserGlobals.windowRef();
        if (!window.gtag) { return; }
        window.gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    }

    private applyGtmQueryParams(url: string) {
        const params: string[] = [`id=${this.gtmId}`];

        if (url.indexOf('?') === -1) {
            url += '?';
        }

        return url + params.join('&');
    }
}

export function gtag(action: string, category: string, label: string, value: number) {
    const windowRef = (window as any);
    if (!windowRef.gtag) { return; }
    windowRef.gtag('event', action, {
        'event_category': category,
        'event_label': label,
        'value': value
    });
}

/**
 * En google analytics la dimension profesional es la numero 1
 */
const dimensionesAlias = {
    profesional: 'dimension1'
};

export function setDimension(dimension: 'profesional', value: string) {
    const windowRef = (window as any);
    if (!windowRef.gtag) { return; }
    windowRef.gtag('set', dimensionesAlias[dimension], value);
}
