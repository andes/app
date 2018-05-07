import { HostBinding, EventEmitter, Component, OnInit, Input, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { CamasService } from '../../../services/camas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SnomedService } from '../../../services/term/snomed.service';
import { query } from '@angular/core/src/animation/dsl';
import { estados } from '../../../utils/enumerados';

@Component({
    selector: 'cama-estado',
    templateUrl: 'camaEstado.html'
})
export class CamaEstadoComponent implements OnInit {
    @Input() cama;
    @Input() organizacion;
    @Input() paciente;
    @Input() idInternacion;
    @Input() nuevoEstado;
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public estado = {
        fecha: new Date(),
        estado: 'desocupada',
        unidadOrganizativa: null,
        especialidades: null,
        esCensable: true,
        genero: null,
        paciente: null,
        idInternacion: null
    };

    constructor(
        public plex: Plex,
        public CamaService: CamasService,
        private route: ActivatedRoute,
        private router: Router,
        public snomed: SnomedService
    ) { }

    ngOnInit() {
        if (this.cama.estados && (this.cama.estados.length > 0)) {
            this.estado = this.cama.estados[this.cama.estados.length - 1];
        }
    }

    /**
     * Devuelve el nombre del sector hoja donde esta la cama. Por lo general, debería ser la habitación.
     */

    public getHabitacionName() {
        let sec = this.cama.sectores;
        if (sec && sec.length > 0) {
            return sec[sec.length - 1].nombre;
        }
        return '';
    }

    loadServicios($event) {
        let servicios = this.organizacion.unidadesOrganizativas;
        $event.callback(servicios);
    }

    loadEspecialidades($event) {
        this.snomed.getQuery({ expression: '<<394733009' }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadGenero($event) {
        // buscamos los conceptos de genero femenino o masculino
        this.snomed.getQuery({ expression: '703118005 OR 703117000' }).subscribe(result => {
            $event.callback(result);
        });
    }

    onchange() {
        if (this.cama.estados && (this.cama.estados.lenght > 0)) {
            this.cama.estados.push(this.estado);
            this.cama.ultimoEstado = this.estado;

        } else {
            this.cama.estados = [this.estado];
            this.cama.ultimoEstado = this.estado;
        }

    }

}
