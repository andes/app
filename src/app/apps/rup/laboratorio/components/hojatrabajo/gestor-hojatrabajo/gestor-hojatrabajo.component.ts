import { Auth } from '@andes/auth';
import { AreaLaboratorioService } from '../../../services/areaLaboratorio.service';
import { ListaHojatrabajoComponent } from './../lista-hojatrabajo/lista-hojatrabajo.component';
import { IHojaTrabajo } from '../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';
import { HojaTrabajoService } from '../../../services/hojatrabajo.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';

@Component({
    selector: 'gestor-hojatrabajo',
    templateUrl: './gestor-hojatrabajo.html'
})
export class GestorHojatrabajoComponent implements OnInit {

    // Propiedades
    public accionIndex = 0;
    public modo = '';
    public hojaTrabajo: IHojaTrabajo;
    public areas: any[];

    @ViewChild(ListaHojatrabajoComponent)
    private listaHojatrabajoComponent: ListaHojatrabajoComponent;

    // Constructor
    constructor(
        private plex: Plex,
        private servicioHojaTrabajo: HojaTrabajoService,
        private areaLaboratorioService: AreaLaboratorioService,
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        if (!this.auth.getPermissions('laboratorio:imprimir:?').length) {
            this.router.navigate(['./inicio']);
        }
        this.loadAreas();
        this.agregarHojaTrabajo();
    }

    cambio($event) {
        this.accionIndex = $event;
        if ($event === 0) {
            this.modo = 'impresion';
        } else if ($event === 1) {
            this.modo = 'practicas';
        } else if ($event === 2) {
            this.modo = 'carga';
        }
        // this.refreshSelection();
    }

    seleccionarHojaTrabajo($event) {
        this.hojaTrabajo = $event;
    }

    guardarHoja() {
        if (!this.hojaTrabajo.id) {
            this.servicioHojaTrabajo.post(this.hojaTrabajo).subscribe(respuesta => {
                this.recargarHojasTrabajo();
            });
        } else {
            this.servicioHojaTrabajo.put(this.hojaTrabajo).subscribe(respuesta => {
                this.recargarHojasTrabajo();
            });
        }
    }

    recargarHojasTrabajo() {
        this.plex.toast('success', ' ', 'Hoja trabajo guardada', 1000);
        this.listaHojatrabajoComponent.cargarListado();
    }

    agregarHojaTrabajo() {
        this.hojaTrabajo = new IHojaTrabajo();
        this.hojaTrabajo.laboratorio = this.auth.organizacion.id;
    }

    vistaPreliminar() {
        console.log('vista preliminar hoja', new Date);
    }

    eliminarHoja() {
        console.log('eliminar hoja', new Date);
    }

    volverLista() {
        console.log('volverLista', new Date);
    }

    cargarHoja() {
        if (this.hojaTrabajo._id) {

        }
    }

    loadAreas() {
        this.areaLaboratorioService.get().subscribe((areas: any) => {
            return this.areas = areas.map((area) => {
                return {
                    id: area._id,
                    nombre: area.nombre
                };
            });
        });
    }
}
