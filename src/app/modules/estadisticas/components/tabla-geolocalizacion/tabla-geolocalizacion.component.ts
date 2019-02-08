import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-tabla-geolocalizacion',
  templateUrl: './tabla-geolocalizacion.component.html',
  styleUrls: ['./tabla-geolocalizacion.component.css']
})
export class TablaGeolocalizacionComponent implements OnInit, OnChanges {

  @Input() data: any;

  constructor() { }

  public columnas: any[];

  ngOnInit() {

  }

  ngOnChanges() {
    if (this.data) {
      let datos = JSON.parse(JSON.stringify(this.data));
      this.columnas = Object.keys(datos).map(key => {
        return Object.keys(datos[key]);
      });
    }
  }

}
