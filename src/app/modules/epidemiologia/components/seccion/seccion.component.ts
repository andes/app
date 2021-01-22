import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html'
})
export class SeccionComponent implements OnInit {
  @Input() seccion
  @Output() onSave = new EventEmitter<any>();

  public disabledEditar = false;
  public disabledGuardar = true;
  constructor() { }

  ngOnInit(): void {
    console.log('seccion', this.seccion);
  }
  save() {
    const params = {};
    this.seccion.forEach(arg => {
      const key = arg.key;
      if (key) {
        const valor = this.seccion[key];
        params[key] = valor;
        if (valor instanceof Date) {
          params[key] = valor;
        } else {
          if (valor && valor.id) {
            params[key] = valor.id;
          } else if (valor === undefined && arg.tipo === 'salida') {
            params[key] = arg.check;
          }
        }
      }
    });
    this.disabledEditar = false;
    this.disabledGuardar = true;
    this.onSave.emit(params);
  }
  edit(seccion) {
    this.disabledEditar = true;
    this.disabledGuardar = false;
    console.log('seccion ', seccion);
  }
}
