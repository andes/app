import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CarnetPerinatalService } from './../services/carnet-perinatal.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'notas-embarazo',
    templateUrl: 'notas-embarazo.component.html'
})

export class NotasEmbarazoComponent {
    public carnet: any;
    public showForm = false;
    public nota = '';

    @Input('carnet')
    set _carnet(value) {
        this.carnet = { ...value };
        this.showForm = false;
        this.uploadNota();
    }
    @Output() returnNotas: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private carnetPerinatalService: CarnetPerinatalService,
        public plex: Plex,
    ) { }

    uploadNota() {
        this.nota = '';
        if (this.carnet.nota) {
            this.nota = this.carnet.nota;
        }
    }

    cerrar() {
        this.returnNotas.emit(null);
        this.showForm = false;
        this.uploadNota();
    }

    editarNota() {
        this.showForm = true;
        this.uploadNota();
    }

    agregarNota() {
        this.showForm = true;
    }

    guardar() {
        this.carnet.nota = this.nota;
        this.carnetPerinatalService.update(this.carnet.id, this.carnet).subscribe(resultado => {
            this.returnNotas.emit(resultado);
            this.showForm = false;
            this.plex.toast('success', 'Nota agregada con éxito');
        }, error => {
            this.plex.toast('danger', 'La nota no pudo ser agregada');
        });
    }

    eliminar() {
        this.carnet.nota = '';
        this.carnetPerinatalService.update(this.carnet.id, this.carnet).subscribe(resultado => {
            this.returnNotas.emit(resultado);
            this.plex.toast('success', 'Nota eliminada con éxito');
            this.showForm = false;
        }, error => {
            this.plex.toast('danger', 'La nota no pudo ser eliminada');
        });
    }

    public cleanSpaces() {
        const contenidoNota = this.nota;
        if (contenidoNota !== '') {
            const notaArray = contenidoNota.split('');
            if (notaArray[0] === ' ') {
                this.nota = this.nota.substring(1);
            }
        }
    }
}
