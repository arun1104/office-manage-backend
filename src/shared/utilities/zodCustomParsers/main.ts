
  export function regexFor_dd_mm_yyyy(): any {
    return /^\d{2}-\d{2}-\d{4}$/;
}
  
export function regexFor_dd_mm_yyyy_withSlash(): any {
  return /^\d{2}\/\d{2}\/\d{4}$/;
}

export function regexFor_financial_year(): any {
  return /^\d{4}-\d{4}$/;
}

export function regexFor_yyyy_mm_dd(): RegExp {
  return /^\d{4}-\d{2}-\d{2}$/;
}
export function regexFor_year(): any {
  return /^\d{4}$/;
}

export function regexForDateWithForwardSlash(): any {
  return /^\d{2}\/\d{2}\/\d{4}$/;
}

export function regexForRemovingSpecialCharacters(): any {
  return /[^a-zA-Z0-9 ]/;
}

export function regexForISOString(): RegExp {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
}