import { FileObject, FILE_EXT, IMAGENES_EXT, } from '@andes/shared';
import { OnInit, Component, Input } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DriveService } from 'src/app/services/drive.service';
import { IPaciente } from '../interfaces/IPaciente';
@Component({
    selector: 'documentos-paciente',
    templateUrl: 'documentos-paciente.html'
})
export class DocumentosPacienteComponent implements OnInit {

    @Input() paciente: IPaciente;

    extensions = [...FILE_EXT, ...IMAGENES_EXT];

    public tipoDocumentos = [{
        id: '1',
        label: 'DNI'
    }];

    public documento = {
        archivos: [],
        tipo: null,
        fecha: null
    };

    public archivos = [];

    showAdd = false;
    invalid = true;


    constructor(
        private driveService: DriveService
    ) { }

    ngOnInit() {
        this.checkValid();
    }

    cancelar() {
        this.showAdd = false;
        this.documento = {
            archivos: [],
            tipo: null,
            fecha: null
        };
        this.archivos = [];
    }

    checkValid() {
        if (!this.documento.tipo) {
            this.invalid = true;
            return;
        }
        if (this.archivos.length === 0) {
            this.invalid = true;
            return;
        }
        this.invalid = false;
    }

    showFormulario() {
        this.showAdd = true;
    }

    onTipoChange() {
        this.checkValid();
    }

    addDocumentos() {
        this.documento.fecha = new Date();
        this.paciente.documentos.push({
            ...this.documento,
            archivos: this.archivos
        });

        this.documento = {
            archivos: [],
            tipo: null,
            fecha: null
        };
        this.archivos = [];

        this.showAdd = false;
    }

    onUpload($event) {
        const { status, body } = $event;
        if (status === 200) {
            this.archivos.push({
                ext: body.ext,
                id: body.id
            });
            this.archivos = [...this.archivos];
            this.checkValid();
        }
    }

    imageRemoved(archivo: FileObject) {
        this.driveService.deleteFile(archivo.id).subscribe(() => {
            const index = this.archivos.findIndex((doc) => doc.id === archivo.id);
            this.archivos.splice(index, 1);
            this.archivos = [...this.archivos];
            this.checkValid();
        });
    }

    removeItem(item) {
        forkJoin(
            item.archivos.map(
                el => this.driveService.deleteFile(el.id)
            )
        ).subscribe(() => {

            const index = this.paciente.documentos.findIndex((doc) => doc === item);
            this.paciente.documentos.splice(index, 1);
        });
    }
}
