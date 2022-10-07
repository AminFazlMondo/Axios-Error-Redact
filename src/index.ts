import {AxiosError} from 'axios'

export const redactedKeyword = '<REDACTED>'

const queryParamsRegex = /(?<=\?|#)\S+/ig
const pathParamsRegex = /(\?|#)\S+/ig

function joinURL(base: string, path: string, queryPath = '') {
  if (!base)
    return `${path}${queryPath}`

  const joint = base.endsWith('/') || path.startsWith('/') ? '' : '/'
  return `${base}${joint}${path}${queryPath}`
}

function extractQueryPath(input: string | undefined): string {
  if (!input)
    return ''

  const match = input.match(pathParamsRegex)?.pop()
  return match || ''
}

function parseData(input: string): any {
  try {
    return JSON.parse(input)
  } catch {
    return
  }
}

function redactData(data: any, flag: boolean): any {
  if (!data)
    return data


  if (typeof data === 'object') {
    if (Array.isArray(data))
      return data.map(value => redactData(value, flag))


    return Object.fromEntries(Object.entries(data).map(([key, value])=> [key, redactData(value, flag)]))
  }

  const parsedData = parseData(data)

  if (parsedData && typeof parsedData === 'object')
    return redactData(parsedData, flag)


  return flag ? redactedKeyword : data
}

export interface HttpErrorResponse {
  message: string;
  fullURL: string;
  response: {
    statusCode?: number;
    statusMessage: string;
    data: any;
  };
  request: {
    baseURL: string;
    path: string;
    method: string;
    data: any;
  };
}

export class AxiosErrorRedactor {
  redactRequestData: boolean
  redactResponseData: boolean
  redactQueryData: boolean

  constructor(redactRequestData = true, redactResponseData = true, redactQueryData = true) {
    this.redactQueryData = redactQueryData
    this.redactRequestData = redactRequestData
    this.redactResponseData = redactResponseData
  }

  skipRequestData(): AxiosErrorRedactor {
    this.redactRequestData = false
    return this
  }

  skipResponseData(): AxiosErrorRedactor {
    this.redactResponseData = false
    return this
  }

  skipQueryData(): AxiosErrorRedactor {
    this.redactQueryData = false
    return this
  }

  private redactUrlQueryParams(url: string | undefined): string {
    if (!url)
      return ''

    return this.redactQueryData ? url.replace(queryParamsRegex, redactedKeyword) : url
  }


  redactError(error: AxiosError | null | undefined): (HttpErrorResponse | null | undefined | Error) {
    if (!error || !error.isAxiosError)
      return error

    const baseURL = this.redactUrlQueryParams(error.config?.baseURL)
    const path = this.redactUrlQueryParams(error.config?.url)
    const queryPath = extractQueryPath(path) ? '' : extractQueryPath(error.request?.path)
    const fullURL = this.redactUrlQueryParams(joinURL(baseURL, path, queryPath))

    return {
      fullURL,
      message: error.message,
      response: {
        statusCode: error.response?.status,
        statusMessage: error.response?.statusText || '',
        data: redactData(error.response?.data, this.redactResponseData),
      },
      request: {
        baseURL,
        path,
        method: error.config?.method || '',
        data: redactData(error.config?.data, this.redactRequestData),
      },
    }
  }
}

export function getErrorInterceptor(): ((error: AxiosError | null | undefined)=> Promise<HttpErrorResponse | null | undefined | Error>) {
  const redactor = new AxiosErrorRedactor()

  return function (error: AxiosError | null | undefined): Promise<HttpErrorResponse | null | undefined | Error> {
    return Promise.reject(redactor.redactError(error))
  }
}