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
  public datos: any[];

  ngOnInit() {

  }

  ngOnChanges() {
    if (this.data) {
      this.datos = [];
      this.columnas = [];
      this.datos = JSON.parse(JSON.stringify(this.data));
      this.columnas = Object.keys(this.datos).map(key => {
        return Object.keys(this.datos[key]);
      });
    }
  }

}
