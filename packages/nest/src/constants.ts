export const OLOG_OPTIONS = Symbol('OLOG_OPTIONS')

export const GetLoggerToken = (context: string): string => ['olog:logger:', context].join('')
