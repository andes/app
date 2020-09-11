import { Component, HostBinding, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

@Component({
    templateUrl: 'home.html',
    styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    public autorizado = false;
    public dashboardCitas = false;
    public dashboardTop = false;
    public dashboardPrestaciones = '';

    constructor(public auth: Auth, private router: Router, private plex: Plex, private route: ActivatedRoute) { }

    ngOnInit() {
        this.plex.updateTitle([
            { route: '/', name: 'ANDES' },
            { name: 'Dashboard' }
        ]);
        this.autorizado = this.auth.getPermissions('visualizacionInformacion:dashboard:?').length > 0;
        this.dashboardCitas = this.auth.check('visualizacionInformacion:dashboard:citas:ver');
        this.dashboardTop = this.auth.check('visualizacionInformacion:dashboard:top:ver');

        // Si no esta autorizado se redirige a la pagina de inicio
        if (!this.autorizado) {
            this.redirect('inicio');
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    toRUP() {
        this.router.navigate(['ambulatorio'], { relativeTo: this.route });
    }

    toCITAS() {
        this.router.navigate(['citas'], { relativeTo: this.route });
    }

    toTOP() {
        this.router.navigate(['top'], { relativeTo: this.route });
    }

}
