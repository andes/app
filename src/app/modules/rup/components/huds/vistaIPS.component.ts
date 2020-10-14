import { Component, OnInit, AfterViewInit, ViewEncapsulation, Input } from '@angular/core';
import { DominiosNacionalesService } from './../../services/dominiosNacionales.service';
// import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'vista-ips',
    templateUrl: 'vistaIPS.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaIPSComponent implements OnInit {
    @Input() registro: any = {};
    public ips = null;
    constructor(public domNacional: DominiosNacionalesService) { }

    ngOnInit() {
    this.domNacional.getDocumentos(this.registro.params).subscribe(result => {
        this.ips = {
            title: result[0].title,
            custodian : result[0].custodian.reference,
            sections : result[0].section
        }
        debugger;
    });
    }


}
