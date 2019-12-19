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
        { id: 'continuidad', nombre: 'Continuidad del cuidado del paciente', valor: true },
        { id: 'facturación/auditoría', nombre: 'Facturación / Auditoría', valor: false },
        { id: 'urgencia', nombre: 'Urgencia / Emergencia', valor: false }
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
