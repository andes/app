import { UsuarioService } from '../../../../services/usuarios/usuario.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { AppComponent } from '../../../../app.component';
import { DisclaimerService } from '../../../../services/disclaimer.service';
import { IDisclaimer } from '../../../../interfaces/IDisclaimer';

@Component({
    templateUrl: 'acceptDisclaimer.html',
    styleUrls: ['acceptDisclaimer.scss']
})
export class AcceptDisclaimerComponent implements OnInit {
    public disclaimer: IDisclaimer = null;
    public version: String = null;
    public texto: String = null;
    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public appComponent: AppComponent,
        public disclaimerService: DisclaimerService,
        public usuarioService: UsuarioService
    ) { }

    ngOnInit() {
        this.plex.updateTitle('Nuevo disclaimer');
        this.disclaimerService.get({ activo: true }).subscribe(data => {
            if (data) {
                this.disclaimer = data[0];
                this.version = this.disclaimer.version;
                this.texto = this.disclaimer.texto;
            }
        });
    }

    logout() {
        this.router.navigate(['/auth/logout']);
    }

    aceptarDisclaimer() {
        let usuario = this.auth.usuario;
        if (!usuario.disclaimers) {
            usuario.disclaimers = [];
        }
        this.usuarioService.saveDisclaimer(usuario, this.disclaimer).subscribe(() => {
            this.router.navigate(['/auth/select-organizacion']);
        });

    }


}
