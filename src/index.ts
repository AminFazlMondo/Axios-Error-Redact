import {AxiosError} from 'axios'
import {AxiosErrorRedactorOptions, HttpErrorResponse} from './types'

export * from './types'

export const redactedKeyword = '<REDACTED>'

const queryParamsRegex = /(?<=\?|#)\S+/ig
const pathParamsRegex = /(\?|#)\S+/ig

/**
 * construct the full url
 * @param base base url
 * @param path sub path
 * @param queryPath query path if exists
 * @returns full url
 */
function joinURL(base: string, path: string, queryPath = '') {
  if (!base)
    return `${path}${queryPath}`

  const joint = base.endsWith('/') || path.startsWith('/') ? '' : '/'
  return `${base}${joint}${path}${queryPath}`
}

/**
 * extracts query path parameters
 * @param input full url
 * @returns query path parameters if found, otherwise empty string
 */
function extractQueryPath(input: string | undefined): string {
  if (!input)
    return ''

  const match = input.match(pathParamsRegex)?.pop()
  return match || ''
}

/**
 * tries to json parse the input
 * @param input any input
 * @returns parsed data if possible, otherwise undefined
 */
function parseData(input: unknown): any {
  try {
    return JSON.parse(input as string)
  } catch {
    return
  }
}

/**
 * recursively redacts sensitive data from the object
 * @param data data to redact
 * @param flag whether to perform redaction
 * @returns redacted data
 */
function redactData(data: unknown, flag: boolean): unknown {
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

/**
 * This class is used to redact sensitive data from Axios error objects.
 */
export class AxiosErrorRedactor {
  private redactRequestData: boolean
  private redactResponseData: boolean
  private redactQueryData: boolean

  constructor(options?: AxiosErrorRedactorOptions) {
    this.redactQueryData = options?.redactQueryDataEnabled ?? true
    this.redactRequestData = options?.redactRequestDataEnabled ?? true
    this.redactResponseData = options?.redactResponseDataEnabled ?? true
  }

  /**
   * Disables redaction of the request data
   * @returns the instance of the redactor
   */
  skipRequestData(): AxiosErrorRedactor {
    this.redactRequestData = false
    return this
  }

  /**
   * Disables redaction of the response data
   * @returns the instance of the redactor
   */
  skipResponseData(): AxiosErrorRedactor {
    this.redactResponseData = false
    return this
  }

  /**
   * Disables redaction of the query data
   * @returns the instance of the redactor
   */
  skipQueryData(): AxiosErrorRedactor {
    this.redactQueryData = false
    return this
  }

  /**
   * redacts query string from the url
   * @param url raw url
   * @returns redacted query string
   */
  private redactUrlQueryParams(url: string | undefined): string {
    if (!url)
      return ''

    return this.redactQueryData ? url.replace(queryParamsRegex, redactedKeyword) : url
  }

  /**
   * Redacts sensitive data from the Axios rejection error
   * @param error any of errors that can be thrown by axios
   * @returns HttpErrorResponse in case of axios error, otherwise passthrough the error
   */
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

/**
 * Simple factory function to create an error interceptor for axios
 * @returns error interceptor for axios
 */
export function createErrorInterceptor(): ((error: AxiosError | null | undefined)=> Promise<HttpErrorResponse | null | undefined | Error>) {
  const redactor = new AxiosErrorRedactor()

  return function (error: AxiosError | null | undefined): Promise<HttpErrorResponse | null | undefined | Error> {
    return Promise.reject(redactor.redactError(error))
  }
}

/**
 * predicate to check if the input is an HttpErrorResponse
 * @param input any input
 * @returns whether the input is an HttpErrorResponse
 */
export function isHttpErrorResponse(input: any): input is HttpErrorResponse {
  return input &&
    typeof input === 'object' &&
    typeof input.fullURL === 'string' &&
    typeof input.message === 'string' &&
    typeof input.request === 'object' &&
    typeof input.response === 'object'
}
