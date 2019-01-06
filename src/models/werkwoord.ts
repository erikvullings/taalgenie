export interface IWerkwoord {
  /** Infinitief (heel werkwoord) */
  inf: string;
  /** De stam van een werkwoord (ik vorm tegenwoordige tijd) */
  stam?: string;
  /** Heel soms is de je/jij vorm anders dan de stam+t */
  ev2?: string;
  /** Heel soms is de hij/zij/het vorm anders dan de stam+t */
  ev3?: string;
  /** Verleden tijd, enkelvoud */
  vt?: string;
  /** Verleden tijd, meervoud */
  vtmv?: string;
  /** Voltooid deelwoord */
  vd?: string;
  /** Bijvoegelijk naamwoord (gebaseerd op VD) */
  bn?: string;
  /** Voorvoegsels */
  vv?: string[];
}
