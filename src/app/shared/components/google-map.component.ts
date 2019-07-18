import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'google-map',
  templateUrl: 'google-map.html',
  styleUrls: ['google-map.scss']
})

export class GoogleMapComponent {

  @Input() latitud: number;
  @Input() longitud: number;
  @Input()
  set infoMarker(value: String) { // infoMarker el mapa
    this._infoMarker = value;
  }
  get infoMarker() {
    return this._infoMarker;
  }

  @Output() changeCoordenadas = new EventEmitter<any[]>();

  draggable = true;  // marcador arrastrable?
  zoom = 13;
  zoomControl = true; // control de zoom (+/-)
  scrollwheel = false; // zoom con mouse
  _infoMarker: String = null;

  // Notifica que la posición del marcador fue modificada manualmente
  setMarker(coordenadas) {
    this.latitud = coordenadas.coords.lat;
    this.longitud = coordenadas.coords.lng;
    this.changeCoordenadas.emit([this.latitud, this.longitud]);
  }
}
