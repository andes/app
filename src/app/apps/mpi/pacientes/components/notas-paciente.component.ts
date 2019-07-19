import { OnInit, Component, Input, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'notas-paciente',
    templateUrl: 'notas-paciente.html'
})

export class NotaComponent implements OnInit {

    @Input() notas = [];
    @Output() notasNew: EventEmitter<any[]> = new EventEmitter<any[]>();

    nuevaNota = '';
    notaError: '';

    constructor(
        private plex: Plex
    ) { }

    ngOnInit() {
        this.mostrarNotas();
    }

    mostrarNotas() {
        let texto: any;
        if (!this.notas) {
            return;
        }
        this.notas.forEach(nota => {
            texto = nota.nota;
            if (nota.destacada) {
                this.plex.toast('info', texto);
            }
        });
    }

    removeNota(i) {
        if (i >= 0) {
            this.notas.splice(i, 1);
        }
    }

    addNota() {
        let nuevaNota = {
            'fecha': new Date(),
            'nota': '',
            'destacada': false
        };
        if (this.nuevaNota) {
            nuevaNota.nota = this.nuevaNota;
            if (this.notas) {
                this.notas.push(nuevaNota);
            } else {
                this.notas = [nuevaNota];
            }
            if (this.notas.length > 1) {
                this.notas.sort((a, b) => {
                    return (a.fecha.getDate() > b.fecha.getDate() ? 1 : (b.fecha.getDate() > a.fecha.getDate() ? -1 : 0));
                });
            }
        }
        this.notasNew.emit(this.notas);
        this.nuevaNota = '';
    }

    destacarNota(indice: any) {
        if (!this.notas) {
            return null;
        }
        this.notas[indice].destacada = !this.notas[indice].destacada;
        if (this.notas.length > 1) {
            this.notas.sort((a, b) => {
                let resultado = (a.destacada && !b.destacada ? -1 : (b.destacada && !a.destacada ? 1 : 0));
                return resultado;
            });
            this.notasNew.emit(this.notas);
        }
    }

}
