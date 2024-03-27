import { Component, Output, ViewChild, Input, EventEmitter } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';
@Component({
    selector: 'modal-motivo-acceso-huds',
    templateUrl: 'modal-motivo-acceso-huds.html'
})

export class ModalMotivoAccesoHudsComponent {

    @ViewChild('modal', { static: true }) modal: PlexModalComponent;
    constructor(
        public motivosHudsService: MotivosHudsService
    ) { };
    @Input()
    set show(value) {
        if (value) {
            this.modal.show();
            this.motivoSelected = null;
        }
    }
    @Output() motivoAccesoHuds = new EventEmitter<string>();
    public motivosAccesoHuds = [];
    public motivoSelected = null;
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit(): void {
        this.motivosHudsService.getMotivosModal().subscribe(
            motivos => {
                motivos.map(motivo => this.motivosAccesoHuds.push({ id: motivo.motivo, label: motivo.descripcion }));

            }
        );
    }

    motivoSelect() {
        return this.motivoSelected === null;
    }

    notificarAccion(flag: boolean) {
        if (flag) {
            const item = this.motivosAccesoHuds.find((elem) => elem.id === this.motivoSelected);
            this.motivoAccesoHuds.emit(item.label);
        } else {
            this.motivoAccesoHuds.emit(null);
        }
        // No se usa this.modal.close() porque interfiere con el cerrar con la tecla ESC
        this.modal.showed = false;
    }
}
