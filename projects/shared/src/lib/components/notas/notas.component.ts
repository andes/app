import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'notas',
    templateUrl: 'notas.html'
})

export class NotasComponent {

    public _nota: any = null;
    public notaPredefinida: any = null;
    public notaEditada: any = null;
    public showForm = false;
    public _notasPredefinidas: any[] = [];
    @Input()
    set nota(value: any) {
        this._nota = value;
        this.notaEditada = value;
        this.showForm = false;
        if (this._notasPredefinidas.length > 0) {
            this.setNotaPredefinida();
        }
    }
    @Input()
    set notasPredefinidas(value: any) {
        this._notasPredefinidas = value;
        if (this._notasPredefinidas.length > 0) {
            this.setNotaPredefinida();
        }
    }
    @Output() cancelar = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<any>();

    editarNota() {
        this.notaEditada = this._nota;
        this.showForm = true;
    }

    eliminar() {
        this._nota = null;
        this.showForm = false;
        this.showForm = false;
        this.guardar.emit(this._nota);
    }

    agregarNota() {
        this.showForm = true;
    }

    cancelarNota() {
        this.showForm = false;
        this.notaEditada = '';
        this.cancelar.emit(false);
    }

    guardarNota() {
        if (this.notaPredefinida && this.notaPredefinida.id !== 'otra') {
            this._nota = this.notaPredefinida.nombre;
        } else {
            this._nota = this.notaEditada;
        }
        this.showForm = false;
        this.guardar.emit(this._nota);
    }

    setNotaPredefinida() {
        const opcionNota = this._notasPredefinidas.find(n => n.nombre === this._nota);
        if (opcionNota) {
            this.notaPredefinida = opcionNota;
        } else {
            if (this._nota) {
                this.notaPredefinida = { id: 'otra', nombre: 'Otra' };
            } else {
                this.notaPredefinida = null;
            }
            this.notaEditada = this._nota;
        }
    }

    public cleanSpaces() {
        const contenidoNota = this.notaEditada;
        if (contenidoNota !== '') {
            const notaArray = contenidoNota.split('');
            if (notaArray[0] === ' ') {
                this.notaEditada = this.notaEditada.substring(1);
            }
        }
    }
}
