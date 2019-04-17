import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPSService } from '../../../../modules/ips/services/ips.service';
import { IPaciente } from '../../../../interfaces/IPaciente';
@Component({
    selector: 'vista-ips',
    templateUrl: 'vistaIPS.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaIPSComponent implements OnInit {

    @Input() registro: any = {};
    @Input() paciente: IPaciente;

    public documentos: any = [];
    public binary: any;
    constructor(private servicioIPS: IPSService) { }

    ngOnInit() {
        this.servicioIPS.getDocumentos(this.paciente.id).subscribe(documentos => {
            this.documentos = documentos.map(
                documento => {
                    documento.id = documento.id;
                    return {
                        urlBinary: documento.urlBinary
                    };
                });
        });
        this.listarBinarios();
        console.log('blaaaaaaaaaaaaaaaaaa', this.binary);
    }

    listarBinarios() {
        for (let i = 0; i < this.documentos.length; i++) {
            this.servicioIPS.getBinarios(this.documentos.urlBinary).subscribe(binary => {
                this.binary = binary;
            });
        }



    }
}
