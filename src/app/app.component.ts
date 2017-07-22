import { environment } from './../environments/environment';
import { Component, OnInit, ModuleWithProviders } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
})

export class AppComponent {
    private initStatusCheck() {
<<<<<<< HEAD
        setTimeout(() => {
            this.server.get('/core/status', { params: null, showError: false, showLoader: false })
                .finally(() => this.initStatusCheck())
                .subscribe(
                (data) => this.plex.updateAppStatus(data),
                (err) => this.plex.updateAppStatus({ API: 'Error' })
                );
        }, 2000);
=======
        // setTimeout(() => {
        //     this.server.get('/core/status', { params: null, showError: false, showLoader: false })
        //         .finally(() => this.initStatusCheck())
        //         .subscribe(
        //         (data) => this.plex.updateStatus(data),
        //         (err) => this.plex.updateStatus({ API: 'Error' })
        //         );
        // }, 2000);
>>>>>>> 3a197d82bc52477f1d5406149af89711bc1688f3
    }

    constructor(public plex: Plex, public server: Server) {
        // Configura server. Debería hacerse desde un provider (http://stackoverflow.com/questions/39033835/angularjs2-preload-server-configuration-before-the-application-starts)
        server.setBaseURL(environment.API);

        // Inicializa la vista
        this.plex.updateTitle('ANDES | Apps Neuquinas de Salud');

        // Inicializa el chequeo de conectividad
        // setInterval(() => {
        //     server.get('/core/status', { params: null, showError: false })
        //         .subscribe(
        //         (data) => this.plex.updateStatus(data),
        //         (err) => this.plex.updateStatus({ API: 'Error' })
        //         );
        // }, 2000);

        // this.initStatusCheck();
        // this.plex.updateMenu([
        //     { label: 'Ir a inicio', icon: 'dna', route: '/incio' },
        //     { label: 'Ir a ruta inexistente', icon: 'flag', route: '/ruta-rota' },
        //     { divider: true },
        //     { label: 'Item con handler', icon: 'wrench', handler: (() => { alert('Este es un handler'); }) }
        // ]);
    }
}
