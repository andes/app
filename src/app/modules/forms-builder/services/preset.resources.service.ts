import { Auth } from '@andes/auth';
import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { OrganizacionService } from 'src/app/services/organizacion.service';

@Injectable({ providedIn: 'root' })
export class FormPresetResourcesService extends ResourceBaseHttp<Event> {
    protected url = '/modules/forms/form-resources/preset-resources';

    constructor(
        protected server: Server,
        private auth: Auth,
        private organizacionService: OrganizacionService
    ) {
        super(server);
    }

    setResource(resource, seccion, paciente) {
        switch (resource) {
        case 'usuario':
            seccion.fields['organizacion'] = { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre };
            seccion.fields['fechanotificacion'] = new Date();
            seccion.fields['responsable'] = this.auth.usuario.nombreCompleto;
            this.organizacionService.getById(this.auth.organizacion.id).subscribe(res => {
                seccion.fields['telefonoinstitucion'] = res.contacto[0]?.valor;
                seccion.fields['localidad'] = {
                    id: res.direccion.ubicacion.localidad.id,
                    nombre: res.direccion.ubicacion.localidad.nombre
                };
                seccion.fields['provincia'] = {
                    id: res.direccion.ubicacion.provincia.id,
                    nombre: res.direccion.ubicacion.provincia.nombre
                };
            });
            break;
        case 'mpi':
            seccion.fields['nacionalidad'] = paciente.direccion[1]?.ubicacion.pais ? paciente.direccion[1].ubicacion.pais : '';
            seccion.fields['direccioncaso'] = paciente.direccion[0]?.valor ? paciente.direccion[0].valor : '';
            seccion.fields['lugarresidencia'] = paciente.direccion[0]?.ubicacion.provincia ? paciente.direccion[0].ubicacion.provincia : '';
            seccion.fields['localidadresidencia'] = paciente.direccion[0]?.ubicacion.localidad ? paciente.direccion[0].ubicacion.localidad : '';
            break;
        }
    }
}
