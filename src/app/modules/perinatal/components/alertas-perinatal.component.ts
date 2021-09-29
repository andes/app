import { Auth } from '@andes/auth';
import { CarnetPerinatalService } from './../services/carnet-perinatal.service';
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'alertas-perinatal',
    templateUrl: './alertas-perinatal.component.html'
})
export class AlertasPerinatalComponent implements OnInit {
    public listado: any[] = [];
    constructor(private carnetPerinatalService: CarnetPerinatalService, public auth: Auth) { }

    ngOnInit(): void {
        const params: any = {
            organizacion: this.auth.organizacion.id
        };

        this.carnetPerinatalService.search(params).subscribe(resultado => {
            this.listado = resultado.filter(item => (moment().diff(moment(item.fechaProximoControl), 'days') >= 1) && !item.fechaFinEmbarazo);
        });
    }

    get hayItems() { return this.listado.length; }

}
