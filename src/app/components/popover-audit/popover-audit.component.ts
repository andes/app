import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Plex } from '@andes/plex';



@Component({
  selector: 'popover-audit',
  templateUrl: 'popover-audit.html'
})
export class PopoverAuditComponent implements OnInit {

  @Input()
  placement: string;
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
      if (this._datos.updatedBy || this._datos.updatedAt) {
        texto += 'Actualizado ';
        texto += this._datos.updatedBy ? 'por ' + this._datos.updatedBy.nombreCompleto + ' ' : '';
        texto += this._datos.updatedAt ? '(' + moment(this._datos.updatedAt, 'dd/MM/yyyy HH:mm').format('DD/MM/YYYY HH:mm') + ')' : '';

      }
    }
    this.textoPopover = texto;
  }


}
