export function normalizeWordleCupSurname(raw: string): string {
    // 1) Trim
    let s = (raw ?? "").trim();
  
    // 2) Normalize accents (NFD) then strip diacritics
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
    // 3) Remove apostrophes (straight + curly)
    s = s.replace(/['’]/g, "");
  
    // 4) Uppercase (game UI uses uppercase like Wordle)
    s = s.toUpperCase();
  
    return s;
  }
  
  export function isEligibleWordleCupSurname(rawSurname: string): boolean {
    const raw = (rawSurname ?? "").trim();
  
    // Exclude surnames that contain spaces (e.g. "van Persie")
    if (/\s/.test(raw)) return false;
  
    const normalized = normalizeWordleCupSurname(raw);
  
    // Only allow A–Z letters after normalization
    if (!/^[A-Z]+$/.test(normalized)) return false;
  
    // Minimum 5 letters
    if (normalized.length < 5) return false;
    if (normalized.length > 8) return false;
  
    return true;
  }
  