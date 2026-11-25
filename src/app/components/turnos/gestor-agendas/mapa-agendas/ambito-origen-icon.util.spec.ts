import { etiquetaAmbitoOrigen, iconoAmbitoOrigen } from './ambito-origen-icon.util';

describe('ambito-origen-icon.util', () => {
    describe('iconoAmbitoOrigen', () => {
        it('mapea cada ámbito al glyph Plex acordado', () => {
            expect(iconoAmbitoOrigen('ambulatorio')).toBe('clipboard-check-outline');
            expect(iconoAmbitoOrigen('internacion')).toBe('cama');
            expect(iconoAmbitoOrigen('guardia')).toBe('hospital-building');
        });

        it('usa ambulatorio por defecto sin ámbito', () => {
            expect(iconoAmbitoOrigen()).toBe('clipboard-check-outline');
            expect(iconoAmbitoOrigen(null)).toBe('clipboard-check-outline');
        });
    });

    describe('etiquetaAmbitoOrigen', () => {
        it('usa el nombre de AMBITOS_ORIGEN', () => {
            expect(etiquetaAmbitoOrigen('ambulatorio')).toBe('Ambulatorio');
            expect(etiquetaAmbitoOrigen('internacion')).toBe('Internación');
            expect(etiquetaAmbitoOrigen('guardia')).toBe('Guardia');
        });

        it('devuelve null sin ámbito', () => {
            expect(etiquetaAmbitoOrigen()).toBeNull();
            expect(etiquetaAmbitoOrigen(null)).toBeNull();
        });
    });
});