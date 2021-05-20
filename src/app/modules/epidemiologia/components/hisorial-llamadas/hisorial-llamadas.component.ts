import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';

@Component({
  selector: 'app-hisorial-llamadas',
  templateUrl: './hisorial-llamadas.component.html'
})
export class HisorialLlamadasComponent implements OnChanges {
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
