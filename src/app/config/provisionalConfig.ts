// Configuration object for Provisional Production Access demo limits
export const PROVISIONAL_CONFIG = {
  /** Duration of provisional access period in days from the first submission */
  PROVISIONAL_PERIOD_DAYS: 30,

  /** Maximum allowed transaction count during the provisional period */
  MAX_PROVISIONAL_TRANSACTIONS: 100,

  /** Maximum allowed cumulative volume in USD during the provisional period */
  MAX_PROVISIONAL_VOLUME_USD: 5000,
};
