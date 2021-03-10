import { Component, Output, EventEmitter, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';


@Component({
    selector: 'app-modal-template',
    templateUrl: 'plex-modal-template.html'
})

export class ModalTemplateComponent {

    @Output() motivoAccesoHuds = new EventEmitter<any>();

    public motivosAccesoHuds = [
        { id: 'auditoria', label: 'Procesos de Auditoría' },
        { id: 'urgencia', label: 'Intervención de Urgencia/Emergencia' },
        { id: 'administrativo', label: 'Procesos Administrativos' },
        { id: 'continuidad', label: 'Intervención en el proceso de cuidado del paciente' }
    ];
    public contenido = '';
    public email = '';
    public motivoSelected = null;

    @ViewChildren('modal') modalRefs: QueryList<PlexModalComponent>;

    openModal(index) {
        this.modalRefs.find((x, i) => i === index).show();
    }

    closeModal(index, formulario?) {
        this.modalRefs.find((x, i) => i === index).close();
        if (formulario) {
            formulario.reset();
        }
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
    }
}
