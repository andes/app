import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';
import { RecetaService } from 'src/app/services/receta.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import * as moment from 'moment';

@Component({
    selector: 'vista-receta',
    templateUrl: 'vistaReceta.html',
    styleUrls: ['vistaReceta.scss']
})
export class VistaRecetaComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() registro: any;

    public showModal = false;

    public columns = [
        {
            key: 'fecha',
            label: 'Fecha',
            sorteable: false,
            opcional: false
        },
        {
            key: 'organizacion',
            label: 'Organización',
            sorteable: false,
            opcional: false
        },
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: false,
            opcional: false
        },
        {
            key: 'diagnostico',
            label: 'Diagnóstico',
            sorteable: false,
            opcional: false
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
            opcional: false
        }
    ];

    public columnsDetalleDispensa = [
        {
            key: 'fecha',
            label: 'Fecha',
            sorteable: false,
            opcional: false
        },
        {
            key: 'sistema',
            label: 'Sistema',
            sorteable: false,
            opcional: false
        },
        {
            key: 'organizacion',
            label: 'Organización',
            sorteable: false,
            opcional: false
        },
        {
            key: 'tipo',
            label: 'Tipo',
            sorteable: false,
            opcional: false
        },
        {
            key: 'estado',
            label: '',
            sorteable: false,
            opcional: false
        }
    ];
    public estadoReceta = {
        vigente: 'success',
        finalizada: 'success',
        suspendida: 'danger',
        vencida: 'danger',
        rechazada: 'danger',
        pendiente: 'info'
    } as { [key: string]: string };

    public estadoDispensa = {
        'sin-dispensa': 'info',
        'dispensada': 'success',
        'dispensa-parcial': 'warning'
    } as { [key: string]: string };

    public listadoDispensas = [];
    public recetas;
    public recetaPrincipal: any;
    public historialRecetas: any[];

    constructor(
        public huds: HUDSService,
        public recetaService: RecetaService,
        public organizacionesService: OrganizacionService
    ) { }

    ngOnInit() {
        this.recetaPrincipal = this.registro.recetas.length > 1 ? this.recetaService.getRecetaPrincipal(this.registro.recetas) : this.registro.recetas[0];
        this.combinarDispensas();
        this.historialRecetas = this.registro.recetas.filter(receta => receta.id !== this.recetaPrincipal.id && receta.fechaRegistro <= this.recetaPrincipal.fechaRegistro);
    }

    combinarDispensas() {
        const organizacionNombre = this.recetaPrincipal.organizacion?.nombre;
        let anteriorDispensada = false;
        this.listadoDispensas = this.recetaPrincipal.estadosDispensa
            .map(rec => {
                let esDuplicada = false;
                if (anteriorDispensada && rec.tipo === 'dispensada') {
                    esDuplicada = true;
                }
                anteriorDispensada = rec.tipo === 'dispensada';
                return {
                    fecha: rec.fecha,
                    tipo: rec.tipo,
                    organizacion: organizacionNombre || 'Sin especificar',
                    sistema: rec.sistema || 'Sin especificar',
                    dispensaDuplicada: esDuplicada,
                    cancelada: rec.cancelada ?? false
                };
            });

        for (let i = 1; i < this.listadoDispensas.length; i++) {
            const actual = this.listadoDispensas[i];

            if (actual.cancelada && actual.cancelada !== false) {
                this.listadoDispensas[i - 1].cancelada = actual.cancelada;
                this.listadoDispensas[i - 1].fechaCancelada = actual.fecha;
                this.listadoDispensas.splice(i, 1);
            }
        }
        return this.listadoDispensas.shift();
    }

    checkDispensaAnticipada(receta) {
        if (receta.estadoDispensaActual && receta.estadoDispensaActual.fecha) {
            const fechaDispensa = moment(receta.estadoDispensaActual.fecha);
            const fechaRegistro = moment(receta.fechaRegistro);
            if (fechaDispensa.isBefore(fechaRegistro)) {
                if (receta.estadoActual.tipo === 'finalizada') {
                    return 'dispensa anticipada';
                } else if (receta.estadoActual.tipo === 'pendiente') {
                    return 'dispensa parcial anticipada';
                }
            }
        }
        return null;
    }

}
