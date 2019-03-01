
import { IMapa } from '../interfaces/IMapa';
import { Component, Input, Output, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { MapaService } from '../services/mapa.service';
import { Plex } from '@andes/plex';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MouseEvent } from '@agm/core';


@Component({
    selector: 'mapa',
    templateUrl: 'mapaImplementacionAndes.html',
    styleUrls: ['google-map.scss', 'mapaimplentacionandesestilo.scss']

})


export class MapaImplementacionAndesComponent implements OnInit {

    // Propiedades privadas
    // ...
    private datos: IMapa[] = [];
    private colorcitas = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    private colortop = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    private colormobile = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_brown.png';
    private colormpi = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    private colorrup = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    // Propiedades públicas
    modelo: IMapa;
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    searchForm: FormGroup;
    markers: IMapa[] = [];
    checkfiltros = {
        checkmpi: true,
        checkcitas: true,
        checkmobile: true,
        checkrup: true,
        checktop: true
    };
    zoom = 8;
    zoomControl = true; // control de zoom (+/-)
    scrollwheel = false; // zoom con mouse
    _infoMarker = '';
    urliconmarker = { url: '' };



    // initial center position for the map
    lat = -38.95735;
    lng = -68.045533333333;

    // Eventos
    @Output() save: EventEmitter<IMapa> = new EventEmitter<IMapa>();

    // Constructor
    constructor(private formBuilder: FormBuilder,
        private mapaService: MapaService,
        private auth: Auth,
        private router: Router, private plex: Plex) {
        this.plex.updateTitle([{
            name: 'Mapa de implementación de Andes'
        }]);
    }


    // Métodos
    ngOnInit() {
        this.loadDatos();
    }

    loadDatos(concatenar: boolean = false) {
        this.mapaService.get()
            .subscribe(
                datos => {
                    this.datos = datos;
                    this.filtrar();
                }
            );
    }

    onReturn(objOrganizacion: IMapa): void {
        this.loadDatos();
    }



    set infoMarker(value: string) { // infoMarker el mapa
        this._infoMarker = value;

    }

    get infoMarker() {
        return this._infoMarker;
    }





    @Output() changeCoordenadas = new EventEmitter<any[]>();


    // Modifica la posicion del marcador
    setMarker(coordenadas) {
        // this.latitud = coordenadas.coords.lat;
        // this.longitud = coordenadas.coords.lng;
        // this.changeCoordenadas.emit([this.latitud, this.longitud]);
    }


    clickedMarker(infofiltro: string, index: number) {
        //  console.log(`clicked the marker: ${infofiltro || index}`)
    }

    markerDragEnd(m: IMapa, $event: MouseEvent) {
        //  console.log('dragEnd', m, $event);
    }


    // openWindow(id) {
    //     this.openedWindow = id; // alternative: push to array of numbers
    // }

    isInfoWindowOpen(id) {
        return this.markers[id].label; // alternative: check if id is in array
    }


    filtrar() {
        this.markers = this.datos.filter(
            i => (this.checkfiltros.checkmpi && i.status.mpi)
                ||
                (this.checkfiltros.checkcitas && i.status.citas)
                ||
                (this.checkfiltros.checkmobile && i.status.mobile)
                ||
                (this.checkfiltros.checkrup && i.status.rup)
                ||
                (this.checkfiltros.checktop && i.status.top)
        ).map(obj => {
            this.urliconmarker.url =
                (  (obj.status.rup ? this.colorrup :
                        (
                            (obj.status.mobile ? this.colormobile :
                                (obj.status.citas ? this.colorcitas :
                                    (
                                        (obj.status.mpi ? this.colormpi :
                                            (obj.status.top ? this.colortop : '')
                                        )
                                    )
                                )
                            )
                        )));
            let rObj = {
                lat: obj.coordenadas[0], lng: obj.coordenadas[1],
                draggable: false,
                iconColorMarker: this.urliconmarker.url,
                infofiltro: (obj.nombreCorto + '<br>' +
                    (obj.status.mpi ? 'Punto de acreditación <br>' : '') +
                    (obj.status.citas ? 'Agendas & Turnos <br>' : '') +
                    (obj.status.mobile ? 'Turnos vía App Móvil <br>' : '') +
                    (obj.status.rup ? 'Registros asistenciales <br>' : '') +
                    (obj.status.top ? 'Tránsito de pacientes ' : '')
                )
            };
            return rObj;
        });
    }
}
