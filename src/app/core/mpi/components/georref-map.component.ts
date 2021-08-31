
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import OlFeature from 'ol/Feature';
import OlPoint from 'ol/geom/Point';
import OlStyle from 'ol/style/Style';
import OlIcon from 'ol/style/Icon';
import OlSourceVector from 'ol/source/Vector';
import OlLayerVector from 'ol/layer/Vector';
import { Component, Output, EventEmitter, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { mapCenter } from '../../../../environments/apiKeyMaps';


@Component({
    selector: 'georref-map',
    templateUrl: 'georref-map.html',
    styleUrls: ['georref-map.scss'],
})
export class GeorrefMapComponent implements OnInit {
    @Input()
    set latLong(value: number[]) { // ingresan como latitud-longitud
        if (value && value.length) {
            this._latLong = value;
            if (this.markerLayer) {
                this.setMarker([this.latLong[1], this.latLong[0]]); // enviamos como longitud-latitud
            }
        }
    }
    get latLong() {
        return this._latLong;
    }

    @Output() changeCoordinates = new EventEmitter<any[]>();
    @ViewChild('map', { static: true }) mapElement: ElementRef;

    map: OlMap;
    source: OlXYZ;
    layer: OlTileLayer;
    view: OlView;
    markerLayer: OlLayerVector; // capa para marcadores
    markerSource: OlSourceVector; // fuente para marcadores
    _latLong = [];

    constructor() { }

    ngOnInit() {
        this.source = new OlXYZ({
            url: 'http://tile.osm.org/{z}/{x}/{y}.png'
        });

        this.layer = new OlTileLayer({
            source: this.source
        });

        this.view = new OlView({
            center: mapCenter,
            zoom: 17,
            projection: 'EPSG:4326',
            rotation: 0
        });

        this.map = new OlMap({
            target: this.mapElement.nativeElement,
            layers: [this.layer],
            view: this.view,
            interactions: defaultInteractions({ doubleClickZoom: false }) // deshabilitamos zoom por doble click
        });


        // ---------- Configuramos una capa dedicada a marcadores ----------

        // Creamos un objeto fuente vacio (Contenedor de array de marcadores)
        this.markerSource = new OlSourceVector({
            features: []
        });

        // Estilo de los iconos
        const iconStyle = new OlStyle({
            image: new OlIcon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 60],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                // src: 'http://openlayers.org/api/img/marker-blue.png'
                src: '//raw.githubusercontent.com/jonataswalker/map-utils/master/images/marker.png'
            }))
        });

        // Creamos la nueva capa
        this.markerLayer = new OlLayerVector({
            source: this.markerSource,
            style: iconStyle
        });

        // Agregamos la nueva capa al mapa
        this.map.addLayer(this.markerLayer);


        // --------- Chequeamos si hay coordenadas pre-cargadas -----------
        if (this.latLong && this.latLong.length) {
            this.setMarker([this.latLong[1], this.latLong[0]]); // enviamos como longitud-latitud
        }
    }

    setMarkerMouseEvent(event) {
        // Obtenemos las coordenadas del evento (longitud-latitud)
        const lonLat = this.map.getEventCoordinate(event);
        this.setMarker(lonLat);
        // Notificamos nuevas coordenadas del marcador (latitud-longitud)
        this.changeCoordinates.emit([lonLat[1], lonLat[0]]);
    }

    setMarker(lonLat) {
        // Chequeamos si hay marcadores existentes
        const markerAdded = this.markerSource.getFeatures();
        if (markerAdded && markerAdded.length) {
            markerAdded[0].getGeometry().setCoordinates(lonLat); // modifica las coordenadas del Point
        } else {
            // Configuramos las caracteristicas del nuevo marcador (Point)
            const marker = new OlFeature({
                geometry: new OlPoint(lonLat)
            });
            // Agregamos el nuevo marcador a la fuente
            this.markerSource.addFeature(marker);
        }
        this.view.animate({ zoom: 17, center: lonLat, duration: 500 });
        this.map.updateSize();
    }

    refresh() {
        setTimeout(() => {
            this.map.updateSize();
        }, 100);
    }
}
