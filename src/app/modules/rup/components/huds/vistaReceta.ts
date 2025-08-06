import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';
import { RecetaService } from 'projects/portal/src/app/services/receta.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';

@Component({
    selector: 'vista-receta',
    templateUrl: 'vistaReceta.html',
    styleUrls: ['vistaReceta.scss']
})
export class VistaRecetaComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() registro: any;

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
        rechazada: 'danger'
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
        this.recetaPrincipal = this.recetaService.getUltimaReceta(this.registro.recetas);
        this.combinarDispensas();
        this.historialRecetas = this.registro.recetas.filter(receta => receta.id !== this.recetaPrincipal.id);
    }

    combinarDispensas() {
        if (!this.recetaPrincipal.estados || !this.recetaPrincipal.estadosDispensa) {
            return;
        }

        let dispensaDuplicada = false;
        this.listadoDispensas = this.recetaPrincipal.estadosDispensa
            .filter(dispensa => dispensa.tipo !== 'sin-dispensa') // Filtrar los que no son 'sin-dispensa'
            .map(dispensa => {
                let organizacionNombre = '';
                const idDispensa = dispensa.idDispensaApp;
                const dispensaCoincidente = this.recetaPrincipal.dispensa.find(dispensaPrimaria => {
                    if (dispensaPrimaria.idDispensaApp === idDispensa) {
                        organizacionNombre = dispensaPrimaria.organizacion?.nombre;
                        return moment(dispensaPrimaria.fecha).isSame(moment(dispensa.fecha), 'day'); // Compara solo el día
                    }
                    return null;
                });

                const esDuplicada = dispensaDuplicada;
                if (dispensa.tipo === 'dispensada') {
                    if (!dispensaDuplicada) {
                        dispensaDuplicada = true;
                    }
                }

                if (dispensaCoincidente) {
                    return {
                        fecha: dispensaCoincidente.fecha,
                        tipo: dispensa.tipo,
                        organizacion: organizacionNombre || 'Sin especificar',
                        sistema: dispensa.sistema || 'Sin especificar',
                        dispensaDuplicada: esDuplicada
                    };
                } else {
                    return {
                        fecha: dispensa.fecha,
                        tipo: dispensa.tipo,
                        organizacion: organizacionNombre || 'Sin especificar',
                        sistema: dispensa.sistema || 'Sin especificar',
                        dispensaDuplicada: esDuplicada
                    };
                }
            });

        return this.listadoDispensas;
    }

}
