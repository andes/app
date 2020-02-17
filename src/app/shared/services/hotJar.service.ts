
import { Injectable } from '@angular/core';
import { UsuariosHttp } from '../../apps/gestor-usuarios/services/usuarios.http';
import { environment } from '../../../environments/environment';

@Injectable()
export class HotjarService {

    constructor(private userService: UsuariosHttp) { }

    initialize() {
        this.userService.me().subscribe(
            (user) => {
                if (user.configuracion && user.configuracion.hotjar) {
                    this.hotjar();
                }
            },
            () => { }
        );
    }

    private hotjar() {
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
