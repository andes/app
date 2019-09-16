import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'lugar-de-nacimiento',
    templateUrl: 'lugarDeNacimiento.html'
})
@RupElement('LugarDeNacimientoComponent')


export class LugarDeNacimientoComponent extends RUPComponent implements OnInit {
    lugarNacimiento;
    lugares;
    otro;
    otroBool = false;

    ngOnInit() {
        if (this.registro.valor) {
            this.getValor();
        } else {
            this.prestacionesService.getRegistrosHuds(this.paciente.id, this.registro.concepto.conceptId).subscribe(prestaciones => {
                // Ver si tomamos el ultimo valor..
                if (prestaciones.length) {
                    this.registro.valor = prestaciones[prestaciones.length - 1].registro.valor;
                    this.getValor();
                }
            });
        }
    }

    private getValor() {
        if (this.registro.valor.id) {
            this.lugarNacimiento = this.registro.valor;
        } else {
            this.otroBool = true;
            this.otro = this.registro.valor;
        }
    }

    loadEfectores(event) {
        if (!event) { return; }
        if (event.query && event.query !== '' && event.query.length > 2) {
            let query = {
                nombre: event.query,
                fields: 'nombre'
            };
            this.organizacionservice.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    otroChanged() {
        if (this.otro) {
            this.registro.valor = this.otro;
        }
    }
    lugarChanged() {
        if (this.lugarNacimiento) {
            this.registro.valor = this.lugarNacimiento;
        }
    }
    boolChanged() {
        if (this.otroBool) {
            this.lugarNacimiento = '';
        }
    }
}
