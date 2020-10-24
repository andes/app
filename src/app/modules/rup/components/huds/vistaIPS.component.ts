import { Component, OnInit, AfterViewInit, ViewEncapsulation, Input } from '@angular/core';
import { DominiosNacionalesService } from './../../services/dominiosNacionales.service';

@Component({
    selector: 'vista-ips',
    templateUrl: 'vistaIPS.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaIPSComponent implements OnInit {
    @Input() registro: any = {};
    public ips = {
        title: '',
        custodian: '',
        entry: []
    };
    constructor(public domNacional: DominiosNacionalesService) { }

    ngOnInit() {
    this.domNacional.getDocumentos(this.registro.params).subscribe(result => {
        if (result && result.resourceType) {
            this.ips = {
                title: result.id,
                custodian : this.registro.params.custodian,
                entry : result.entry
            };
        } else {
            this.ips = {
                title: 'No existen registros',
                custodian: '',
                entry: []
            };
        }
    });
    }


}
