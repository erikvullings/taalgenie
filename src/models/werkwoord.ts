export interface IWerkwoord {
  /** Infinitief (heel werkwoord) */
  inf: string;
  /** De stam van een werkwoord (ik vorm tegenwoordige tijd) */
  stam?: string;
  /** Heel soms is de jij/hij/zij/het vorm anders dan de stam+t, bv bij staan, met stam sta en jij/hij staat */
  ev?: string;
  /** Verleden tijd, enkelvoud */
  vt?: string;
  /** Verleden tijd, meervoud */
  vtmv?: string;
  /** Voltooid deelwoord */
  vd?: string;
  /** Voorvoegsels */
  vv?: string[];
}
