"use strict";
var especialidad_component_1 = require('./components/especialidad/especialidad.component');
var profesional_component_1 = require('./components/profesional/profesional.component');
var establecimiento_component_1 = require('./components/establecimiento/establecimiento.component');
var router_1 = require('@angular/router');
var appRoutes = [
    {
        path: 'establecimiento',
        component: establecimiento_component_1.EstablecimientoComponent
    },
    {
        path: 'profesional',
        component: profesional_component_1.ProfesionalComponent
    },
    {
        path: 'especialidad',
        component: especialidad_component_1.EspecialidadComponent
    }
];
exports.routing = router_1.RouterModule.forRoot(appRoutes);
//# sourceMappingURL=app.routing.js.map