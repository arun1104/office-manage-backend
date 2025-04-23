
export class ClassUtil {
    static bindMethods<T>(instance: T): T {
        const prototype = Object.getPrototypeOf(instance);
        Object.getOwnPropertyNames(prototype).forEach((name) => {
            if (name !== 'constructor' && typeof instance[name] === 'function') {
                instance[name] = instance[name].bind(instance);
            }
        });
        return instance;
    }
}