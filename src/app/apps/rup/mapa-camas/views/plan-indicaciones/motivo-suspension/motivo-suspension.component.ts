import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'motivo-suspension',
    templateUrl: 'motivo-suspension.component.html'
})

export class MotivoSuspensionComponent {

    @Input() motivo;
    @Input() capa;
    @Input() rechazar = null;
    @Output() cancelar = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<any>();
    public nuevoMotivo;
    public editando = false;

    guardarSuspension() {
        this.motivo = this.nuevoMotivo.slice();
        this.guardar.emit(this.motivo);
        this.nuevoMotivo = null;
        this.editando = false;
    }

    cancelarSuspension() {
        if (!this.editando) {
            this.cancelar.emit(false);
        }
        this.editando = false;
        this.nuevoMotivo = null;
    }

    editar() {
        if (this.motivo?.length) {
            this.nuevoMotivo = this.motivo;
        }
        this.editando = true;
    }

    puedeEditar() {
        return this.motivo && !this.editando && this.capa === 'farmaceutica';
    }
}
