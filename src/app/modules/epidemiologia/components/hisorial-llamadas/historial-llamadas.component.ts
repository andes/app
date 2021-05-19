import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-historial-llamadas',
  templateUrl: './historial-llamadas.component.html'
})
export class HistorialLlamadasComponent implements OnChanges {
  @Input() llamados = [];
  public ficha$: Observable<any>;
  public idPrestacion;
  public showLlamados = [];
  public columns = [
    {
      key: 'fecha',
      label: 'Fecha/Hora',
    },
    {
      key: 'registro',
      label: 'Registro/Prestación'
    },
    {
      key: 'acciones',
      label: ''
    }
  ];

  constructor() { }

  ngOnChanges(): void {
    this.showLlamados = this.llamados.reverse();
  }

  verPrestacion(prestacion) {
    this.idPrestacion = prestacion;
  }

}
