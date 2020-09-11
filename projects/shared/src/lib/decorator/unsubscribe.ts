/**
 * Cancela automaticamente una subcripción previa antes de realizar una nueva consulta.
 * La función donde se use el decorador debe retornar el elemento Subcriber de Angular.
 * Util para evitar varios request a la API.
 */
export function Unsubscribe() {
    return (target, key, descriptor) => {
        const original = descriptor.value;
        let subscriptions;

        function unsubscribe() {
            if (subscriptions && subscriptions.unsubscribe) {
                subscriptions.unsubscribe();
                subscriptions = null;
            }
        }

        descriptor.value = function () {
            unsubscribe();
            const temp = original.apply(this, arguments);
            if (!temp) {
                unsubscribe();
            } else {
                subscriptions = temp;
            }

            return temp;
        };
    };
}
