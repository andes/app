
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Auth } from '@andes/auth';

@Injectable({ providedIn: 'root' })
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
        if (this.ready) {
            return;
        }
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
