import { UsuarioService } from '../../../../services/usuarios/usuario.service';
import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { DisclaimerService } from '../../../../services/disclaimer.service';
import { IDisclaimer } from '../../../../interfaces/IDisclaimer';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';

@Component({
    selector: 'modal-disclaimer',
    templateUrl: 'modal-disclaimer.html',
    styleUrls: ['modal-disclaimer.scss']
})

export class ModalDisclaimerComponent implements OnInit {
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    public disclaimer: IDisclaimer = null;
    public version: String = null;
    public texto: String = null;

    @Input()
    set show(value) {
        if (value) {
            this.modal.show();
        }
    }

    constructor(
        private auth: Auth,
        private router: Router,
        public disclaimerService: DisclaimerService,
        public usuarioService: UsuarioService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.disclaimerService.get({ activo: true }).subscribe(data => {
            if (data) {
                this.disclaimer = data[0];
                this.version = this.disclaimer.version;
                this.texto = this.disclaimer.texto;
            }
        });
    }

    cancelar() {
        this.router.navigate(['/auth/login']);
    }

    aceptarDisclaimer() {
        let usuario: any = this.auth.usuario;
        if (!usuario.disclaimers) {
            usuario.disclaimers = [];
        }
        this.usuarioService.saveDisclaimer(usuario, this.disclaimer).subscribe(() => {
            this.router.navigate(['inicio']);
        });
    }


}
