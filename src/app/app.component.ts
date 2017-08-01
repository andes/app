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
        if (environment.APIStatusCheck) {
            setTimeout(() => {
                this.server.get('/core/status', { params: null, showError: false, showLoader: false })
                    .finally(() => this.initStatusCheck())
                    .subscribe(
                    (data) => this.plex.updateAppStatus(data),
                    (err) => this.plex.updateAppStatus({ API: 'Error' })
                    );
            }, 2000);
        } else {
            this.plex.updateAppStatus({ API: 'OK' });
        }
    }

    constructor(public plex: Plex, public server: Server) {
        // Configura server. Debería hacerse desde un provider (http://stackoverflow.com/questions/39033835/angularjs2-preload-server-configuration-before-the-application-starts)
        server.setBaseURL(environment.API);

        // Inicializa la vista
        this.plex.updateTitle('ANDES | Apps Neuquinas de Salud');

        // Inicializa el chequeo de conectividad
        this.initStatusCheck();

        // Menú principal
        this.plex.updateMenu([
            { label: 'Página principal', icon: 'home', route: '/inicio' },
            { divider: true },
            { label: 'MPI: Indice Maestro de Pacientes', icon: 'account-multiple-outline', route: '/mpi' },
            { label: 'CITAS: Agendas & Turnos', icon: 'calendar', route: '/citas/gestor_agendas' },
            { label: 'RUP: Registro Universal de Prestaciones', icon: 'contacts', route: '/rup' },
            { divider: true },
            { label: 'Cerrar Sesión', icon: 'logout', route: '/login' }
        ]);
    }
}
