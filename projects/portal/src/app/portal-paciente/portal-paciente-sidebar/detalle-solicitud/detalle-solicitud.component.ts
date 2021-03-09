import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Solicitud } from '../../../modelos/solicitud';

@Component({
    selector: 'detalle-solicitud',
    templateUrl: './detalle-solicitud.component.html',
})
export class DetalleSolicitudComponent implements OnInit {

    public selectedId;
    public solicitudes$;
    solicitud$: Observable<Solicitud>;

    cronologia = [
        {
            organizacion: "Hospital Provincial Neuquén 'Dr. Eduardo Castro Rendón'",
            tipoEstablecimiento: "hospital",
            profesional: "Giardino, Walter",
            fecha: "21/07/2020",
            hora: "10:59",
            icono: "check",
            tipo: "success",
            evento: "Llegada a organización de destino",
        },
        {
            organizacion: "Centro de salud 'Las Lajas'",
            tipoEstablecimiento: "centro-salud",
            profesional: "Barilari, Adrián",
            fecha: "21/07/2020",
            hora: "10:37",
            icono: "avion",
            tipo: "warning",
            evento: "Traslado especial en curso",
        },
        {
            organizacion: "Hospital Provincial Neuquén 'Dr. Eduardo Castro Rendón'",
            tipoEstablecimiento: "hospital",
            profesional: "Giardino, Walter",
            fecha: "21/07/2020",
            hora: "06:15",
            icono: "hospital",
            tipo: "success",
            evento: "Aprobación de solicitud en organización de destino",
        },
        {
            organizacion: "Centro de salud 'Las Lajas'",
            tipoEstablecimiento: "centro-salud",
            profesional: "Barilari, Adrián",
            fecha: "21/07/2020",
            hora: "06:05",
            icono: "centro-salud",
            tipo: "info",
            evento: "Nueva solicitud de traslado especial",
        },
        {
            organizacion: "Hospital 'Carlos Heller",
            tipoEstablecimiento: "hospital",
            profesional: "Monteverde, María Laura",
            fecha: "21/07/2020",
            hora: "05:15",
            icono: "cancel",
            tipo: "danger",
            evento: "Rechazo de solicitud de traslado",
        },
        {
            organizacion: "Centro de salud 'Las Lajas'",
            tipoEstablecimiento: "centro de salud",
            profesional: "Barilari, Adrián",
            fecha: "21/07/2020",
            hora: "04:57",
            icono: "centro-salud",
            tipo: "info",
            evento: "Solicitud de traslado especial",
        },
        {
            organizacion: "Sala de primeros auxilios 'Huinganco'",
            tipoEstablecimiento: "centro de salud",
            profesional: "Barilari, Adrián",
            fecha: "21/07/2020",
            hora: "02:15",
            icono: "ambulancia",
            tipo: "warning",
            evento: "Solicitud de emergencia",
        },
    ]

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.solicitudes$ = this.prestacionService.getSolicitudes();

        //mostrar detalle de prestacion
        this.solicitud$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getSolicitud(params.get('id')))
        );
    }


}
