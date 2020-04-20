import { Component, Output, ViewChild, Input, EventEmitter, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';

@Component({
    selector: 'modal-seleccion-email',
    templateUrl: 'modal-seleccion-email.html'
})

export class ModalSeleccionEmailComponent implements OnInit, AfterViewInit {

    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    ngAfterViewInit() {
        // Estaría bueno una opcion de plex para que el modal se visualice solo al renderizarlo
        // [PLEX-76]
        this.modal.show();
        // Hasta que no este [PLEX-76] se debe aplicar un detectChanges
        this.cd.detectChanges();
    }

    @Output() email = new EventEmitter<any>();

    public emails = [];

    public emailSelected = null;

    // Constructor
    constructor(
        private auth: Auth,
        public organizacionService: OrganizacionService,
        private cd: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.getEmails();
    }

    getEmails() {
        this.organizacionService.configuracion(this.auth.organizacion.id).subscribe(configuracion => {
            if (configuracion && configuracion.emails) {
                this.emails = configuracion.emails;
            }
        });
    }

    emailSelect() {
        return this.emailSelected === null;
    }

    notificarAccion(flag: boolean) {
        if (flag) {
            const item = this.emails.find((elem) => elem.email === this.emailSelected.email);
            this.email.emit(item.email);
        } else {
            this.email.emit(null);
        }
    }
}
