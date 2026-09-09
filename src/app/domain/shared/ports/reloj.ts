/**
 * Puerto de dominio que abstrae la obtención del tiempo actual.
 * Permite que los casos de uso y simulaciones sean deterministas
 * al desacoplarlos del reloj del sistema.
 */
export interface Reloj {
  /**
   * Obtiene los milisegundos transcurridos desde Unix Epoch.
   * No lanza excepciones.
   */
  ahora(): number;
}
