import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../interfaces/IPaciente';
import { PacienteService } from '../services/paciente.service';
@Component({
    selector: 'documentos-paciente',
    templateUrl: 'documentos-paciente.html'
})
export class DocumentosPacienteComponent implements OnInit {

    public documento =
        {
            archivos: '',
            tipo: '',
            fecha: null
        };
    public documentos = [];
    datos = [{
        id: '1',
        label: 'DNI'
    }
    ];

    ngOnInit() {

    }


    addDocumentos() {
        console.log(this.documento);
        this.documento.fecha = new Date();
        this.documentos.push(this.documento);
        console.log(this.documentos);
    }
}
