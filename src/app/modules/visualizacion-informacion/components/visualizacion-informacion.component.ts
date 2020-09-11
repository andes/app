import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';


@Component({
    selector: 'app-visualizacion-informacion',
    templateUrl: './visualizacion-informacion.component.html',
    styleUrls: ['visualizacion-informacion.scss']
})
export class VisualizacionInformacionComponent implements OnInit {
    public showReportes = false;
    public showDashboard = false;
    public showBiQueries = false;
    public showVisualizacion = false;

    constructor(private router: Router, private plex: Plex, public auth: Auth) { }

    ngOnInit() {
        this.plex.updateTitle([
            { route: '/', name: 'ANDES' },
            { name: 'Visualizacion de Información' }
        ]);
        this.showVisualizacion = this.auth.getPermissions('visualizacionInformacion:?').length > 0;
        if (this.showVisualizacion) {
            this.showReportes = this.auth.getPermissions('visualizacionInformacion:reportes:?').length > 0;
            this.showDashboard = this.auth.getPermissions('visualizacionInformacion:dashboard:?').length > 0;
            this.showBiQueries = this.auth.getPermissions('visualizacionInformacion:biQueries:?').length > 0;

        } else {
            this.router.navigate(['./inicio']);
        }
    }

    toDashboard() {
        this.router.navigate(['dashboard']);
    }

    toReportes() {
        this.router.navigate(['reportes']);
    }

    toBiQueries() {
        this.router.navigate(['/visualizacion-informacion/bi-queries']);
    }
}
