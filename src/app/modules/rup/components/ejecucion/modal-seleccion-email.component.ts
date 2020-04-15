import { Component, Output, ViewChild, Input, EventEmitter, OnInit } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';

@Component({
    selector: 'modal-seleccion-email',
    templateUrl: 'modal-seleccion-email.html'
})

export class ModalSeleccionEmailComponent implements OnInit {

    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    @Input()
    set show(value) {
        if (value) {
            this.modal.show();
            this.emailSelected = null;
        }
    }

    @Output() email = new EventEmitter<any>();

    public emails = [];

    public emailSelected = null;

    // Constructor
    constructor(
        private auth: Auth,
        public organizacionService: OrganizacionService) {
    }

    ngOnInit() {
        this.getEmails();
    }

    getEmails() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            let org = organizacion;
            if (org.configuraciones && org.configuraciones.emails) {
                this.emails = org.configuraciones.emails;
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
        this.modal.close();
    }
}
