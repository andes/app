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
        }
    }

    @Output() motivoAccesoHuds = new EventEmitter<any>();

    public motivosAccesoHuds = [
        { id: 'auditoria', nombre: 'Procesos de Auditoría', valor: true },
        { id: 'urgencia', nombre: 'Intervención de Urgencia/Emergencia', valor: false },
        { id: 'administrativo', nombre: 'Procesos Administrativos', valor: false },
        { id: 'continuidad', nombre: 'Invervención en el proceso de cuidado del paciente', valor: false }
    ];
    public motivoSelected = this.motivosAccesoHuds[0].nombre;

    public changeMotivoAccesoHuds(seleccion) {
        this.motivosAccesoHuds.forEach(motivo => {
            motivo.valor = (motivo.id === seleccion.id) ? true : false;
        });
        this.motivoSelected = seleccion.nombre;
    }

    notificarAccion(flag: boolean) {
        if (flag) {
            this.motivoAccesoHuds.emit(this.motivoSelected);
        } else {
            this.motivoAccesoHuds.emit(null);
        }
        this.modal.close();
    }
}
