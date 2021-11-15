import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-respiracion-asistida',
    templateUrl: 'respiracionAsistida.html'
})
@RupElement('RespiracionAsistidaComponent')
export class RespiracionAsistidaComponent extends RUPComponent implements OnInit {
    public dispositivos = [];
    public hoy = new Date();
    public respirador: {
        dispositivo: any;
        fechaDesde: Date;
    };

    ngOnInit() {
        this.dispositivoService.search().subscribe(disp => this.dispositivos = disp);
        this.respirador = this.registro.valor || { dispositivo: null, fechaDesde: null};
    }

    setValues() {
        this.registro.valor = {
            dispositivo: this.respirador.dispositivo,
            fechaDesde: this.respirador.fechaDesde
        };
    }
}
