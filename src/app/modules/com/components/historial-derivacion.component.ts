import { Input, Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { DerivacionesService } from 'src/app/services/com/derivaciones.service';
import { Auth } from '@andes/auth';
import { AdjuntosService } from '../../rup/services/adjuntos.service';

@Component({
    selector: 'historial-derivacion',
    templateUrl: './historial-derivacion.html',
    styleUrls: ['./adjuntos.scss', './punto-inicio.scss']
})
export class HistorialDerivacionComponent {
    public derivacion;
    public itemsHistorial = [];
    public fileToken;
    public adjuntos = [];

    @Input() esCOM = false;
    @Input('derivacion')
    set _derivacion(value) {
        this.derivacion = value;
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
            this.cargarItemsHistorial();
        });
    }

    constructor(
        public auth: Auth,
        private derivacionesService: DerivacionesService,
        public adjuntosService: AdjuntosService,
        public plex: Plex
    ) { }

    cargarItemsHistorial() {
        let historial = [...this.derivacion.historial.filter(elto => !elto.eliminado)];
        if (!historial) {
            historial = [];
        }
        this.itemsHistorial = historial.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
        this.itemsHistorial.forEach(item => {
            this.adjuntos[item.id] = this.documentos(item);
        });
    }

    documentos(estado) {
        let adjuntosEstado = estado.adjuntos;
        if (adjuntosEstado) {
            return adjuntosEstado.map((doc) => {
                doc.url = this.adjuntosService.createUrl('drive', doc, this.fileToken);
                return doc;
            });
        } else {
            return [];
        }
    }

    eliminarNota(nota) {
        this.plex.confirm('¿Está seguro de querer eliminar la nota?', 'Eliminar nota').then((resultado) => {
            if (resultado) {
                const index = this.derivacion.historial.findIndex(x => x._id === nota._id);
                nota.eliminado = true;
                this.derivacion.historial[index] = nota;
                this.derivacionesService.update(this.derivacion._id, this.derivacion).subscribe((derivacion) => {
                    this.plex.toast('success', 'Nota eliminada');
                    this.cargarItemsHistorial();
                });
            }
        });
    }
}
