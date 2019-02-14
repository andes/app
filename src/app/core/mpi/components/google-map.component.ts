import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

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


  @Input()
  set mostrar(value: boolean) { // variable que indica si se debe mostrar el mapa
    this._mostrar = value;
    this.mostrarOcultarMapa();
  }
  get mostrar() {
    return this._mostrar;
  }
  @Output() changeCoordenadas = new EventEmitter<any[]>();
  @ViewChild('mapa') mapa: ElementRef;

  draggable = true;  // marcador arrastrable?
  zoom = 13;
  zoomControl = true; // control de zoom (+/-)
  scrollwheel = false; // zoom con mouse
  _infoMarker: String = '';
  _mostrar = false;


  // Modifica la posicion del marcador
  setMarker(coordenadas) {
    this.latitud = coordenadas.coords.lat;
    this.longitud = coordenadas.coords.lng;
    this.changeCoordenadas.emit([this.latitud, this.longitud]);
  }

  mostrarOcultarMapa() {
    if (this.mostrar) {
      window.setTimeout(() => {
        this.mapa.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }
}
