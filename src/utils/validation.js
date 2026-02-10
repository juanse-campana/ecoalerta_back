/**
 * Valida una cédula ecuatoriana usando el algoritmo de Módulo 10
 * @param {string} cedula 
 * @returns {boolean}
 */
export const isCedulaValida = (cedula) => {
    // 1. Validar longitud y que sean solo números
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
        return false;
    }

    // 2. Validar código de provincia (primeros dos dígitos)
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 0 || provincia > 24) {
        return false;
    }

    // 3. Validar tercer dígito (menor a 6 para personas naturales)
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito >= 6) {
        return false;
    }

    // 4. Algoritmo Módulo 10
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const digitoVerificadorOriginal = parseInt(cedula.substring(9, 10), 10);
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
        if (valor > 9) {
            valor -= 9;
        }
        suma += valor;
    }

    const residuo = suma % 10;
    const digitoVerificadorCalculado = residuo === 0 ? 0 : 10 - residuo;

    return digitoVerificadorCalculado === digitoVerificadorOriginal;
};

/**
 * Valida el formato de un correo electrónico
 * @param {string} email 
 * @returns {boolean}
 */
export const isEmailValido = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
};
