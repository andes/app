import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'shared-popover-audit',
  templateUrl: 'popover-audit.html'
})
export class PopoverAuditComponent implements OnInit {

  @Input()
  placement: string;
  @Input()
  showUpdate: boolean;
  private _datos: any;
  @Input('data')
  set data(value: any) {
    this._datos = value;
  }
  get data(): any {
    return this._datos;
  }

  textoPopover: string;

  constructor() {
  }

  ngOnInit() {

    let texto = '';
    if (this._datos) {
      if (this._datos.createdBy || this._datos.createdAt) {
        texto += 'Registrado ';
        texto += texto + this._datos.createdBy ? 'por ' + this._datos.createdBy.nombreCompleto + ' ' : '';
        texto += texto + this._datos.createdAt ? 'el día ' + moment(this._datos.createdAt, 'dd/MM/yyyy HH:mm').format('DD/MM/YYYY HH:mm') : '';
      }
      if (this.showUpdate && (this._datos.updatedBy || this._datos.updatedAt)) {
        texto += 'Actualizado ';
        if (this._datos.emitidoPor === 'appMobile') {
          texto += this._datos.updatedBy ? 'por ' + this._datos.updatedBy.nombre + ' ' : '';
        } else {
          texto += this._datos.updatedBy ? 'por ' + this._datos.updatedBy.nombreCompleto + ' ' : '';
        }
        texto += this._datos.updatedAt ? '(' + moment(this._datos.updatedAt, 'dd/MM/yyyy HH:mm').format('DD/MM/YYYY HH:mm') + ')' : '';

      }
    }
    this.textoPopover = texto;
  }
}
