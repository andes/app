
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Auth } from '@andes/auth';

@Injectable()
export class HotjarService {
    private ready = false;
    constructor(private auth: Auth) {
        this.auth.session().subscribe((sesion) => {
            if (sesion && sesion.feature && sesion.feature.hotjar) {
                this.hotjar();
            }
        });

    }

    private hotjar() {
        if (this.ready) { return; }
        this.ready = true;
        (function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
            h.hj = h.hj || function () {
                (h.hj.q = h.hj.q || []).push(arguments);
            };

            h._hjSettings = { hjid: environment.HOTJAR_KEY, hjsv: 6 };
            a = o.getElementsByTagName('head')[0];

            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;

            a.appendChild(r);

        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }

}

/**

 <!-- Global site tag (gtag.js) - Google Analytics -->
 <script async src="https://www.googletagmanager.com/gtag/js?id=UA-145168802-2"></script>
 <script>
   window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
   gtag('js', new Date());

   gtag('config', 'UA-145168802-2');
 </script>


https://github.com/mzuccaroli/angular-google-tag-manager/blob/master/projects/angular-google-tag-manager/src/lib/angular-google-tag-manager.service.ts


setInterval(() => {
            (window as any).gtag('event', 'sign_up', {
                'event_category': 'login',
                'event_label': '',
                'value': 10
            });
        },
            1000);


        setInterval(() => {
            (window as any).gtag('event', 'iniciar-prestacion', {
                'event_category': 'rup',
                'event_label': 'gato',
                'value': 2
            });
        },
            5000);

this.router.events.subscribe(event => {

            if (event instanceof NavigationEnd) {
                if (window !== undefined) {
                    (window as any).gtag('config', 'UA-145168802-2', {
                        'page_title': 'homepage',
                        'page_path': event.urlAfterRedirects
                    });
                    // (window as any).gtag('set', 'page', event.urlAfterRedirects);
                    // (window as any).ga('send', 'pageview');
                }

            }

        });

            <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-145168802-2"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());

        gtag('config', 'UA-145168802-2');
    </script>

 */
