/** Inclinación "puesta a mano" de cada carta: fija por número, entre −2° y 2°. */
export const tiltFor = (number: number) => (((number * 37) % 9) - 4) * 0.5
