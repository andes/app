import { Component, Output, ViewChild, Input, EventEmitter } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
@Component({
    selector: 'modal-motivo-acceso-huds',
    templateUrl: 'modal-motivo-acceso-huds.html'
})

export class ModalMotivoAccesoHudsComponent {

    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    @Input()
    set show(value) {
        if (value) {
            this.modal.show();
            this.motivoSelected = null;
        }
    }
    @Output() motivoAccesoHuds = new EventEmitter<[String, String]>();
    public motivosAccesoHuds = [
        { id: 'auditoria', label: 'Procesos de Auditoría' },
        { id: 'urgencia', label: 'Intervención de Urgencia/Emergencia' },
        { id: 'administrativo', label: 'Procesos Administrativos' },
        { id: 'continuidad', label: 'Intervención en el proceso de cuidado del paciente' }
    ];
    public motivoSelected = null;
    public detalleMotivo = '';
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface

    motivoSelect() {
        return this.motivoSelected === null;
    }

    notificarAccion(flag: boolean) {
        if (flag) {
            const item = this.motivosAccesoHuds.find((elem) => elem.id === this.motivoSelected);
            this.motivoAccesoHuds.emit([item.label, this.detalleMotivo]);
        } else {
            this.motivoAccesoHuds.emit(null);
        }
        // No se usa this.modal.close() porque interfiere con el cerrar con la tecla ESC
        this.modal.showed = false;
    }
}
