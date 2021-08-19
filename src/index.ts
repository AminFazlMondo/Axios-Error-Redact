import { AxiosError } from 'axios'

export const redactedKeyword = '<REDACTED>'

const queryParamsRegex = /(?<=\?|#)\S+/ig

export interface HttpErrorResponse {
  message: string;
  response: {
    statusCode?: number;
    statusMessage: string;
    data?: any;
  };
  baseUrl: string;
  fullUrl: string;
  path: string;
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

    return {
      baseUrl: this.redactUrlQueryParams(error.config.baseURL),
      fullUrl: this.redactUrlQueryParams(error.request?.path),
      path: this.redactUrlQueryParams(error.config.url),
      message: error.message,
      response:{
        statusCode: error.response?.status,
        statusMessage: error.response?.statusText || '',
        data: error.response?.data
      }
    }
  }
}