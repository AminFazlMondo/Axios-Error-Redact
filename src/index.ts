import { AxiosError } from 'axios'

export const redactedKeyword = '<REDACTED>'

function redactRequest(error: AxiosError): void {
  const { request, config } = error
  if (request?.data)
    request.data = redactedKeyword

  if (config.data)
    config.data = redactedKeyword
}

const queryParamsRegex = /(?<=\?|#)\S+/ig
function redactUrlQueryParams(url: string): string {
  return url.replace(queryParamsRegex, redactedKeyword)
}

function redactQuery(error: AxiosError): void {
  const { request, config } = error
  if (config.url)
    config.url = redactUrlQueryParams(config.url)

  if (request.path)
    request.path = redactUrlQueryParams(request.path)

  if (request.res?.responseUrl)
    request.res.responseUrl = redactUrlQueryParams(request.res.responseUrl)

  if (request.res?._currentUrl)
    request.res._currentUrl = redactUrlQueryParams(request.res._currentUrl)

  if (request._redirectable?._currentUrl)
    request._redirectable._currentUrl = redactUrlQueryParams(request._redirectable._currentUrl)

  if (request.res?.req?._redirectable?._options?.search)
    request.res.req._redirectable._options.search = redactUrlQueryParams(request.res.req._redirectable._options.search)

  if (request.res?.req?._redirectable?._options?.path)
    request.res.req._redirectable._options.path = redactUrlQueryParams(request.res.req._redirectable._options.path)

  if (request._header)
    request._header = redactUrlQueryParams(request._header)
}

const authorizationRegex = /(?<=Authorization:).+/ig
function redactAuthorization(error: AxiosError): void {
  const { config, request } = error
  const { headers } = config

  if (!headers)
    return

  if (headers.Authorization)
    headers.Authorization = redactedKeyword

  if (headers.authorization)
    headers.authorization = redactedKeyword

  if (headers.AUTHORIZATION)
    headers.AUTHORIZATION = redactedKeyword

  if (config.auth) {
    config.auth.username = redactedKeyword
    config.auth.password = redactedKeyword
  }

  const _header = request?.connection?._httpMessage?._header
  if (_header)
    request.connection._httpMessage._header = _header.replace(authorizationRegex, redactedKeyword)
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

  redactError(error: AxiosError | null | undefined): (AxiosError | null | undefined) {
    if (!error || !error.isAxiosError)
      return

    redactAuthorization(error)

    if (this.redactRequestData)
      redactRequest(error)

    if (this.redactQueryData)
      redactQuery(error)

    return error
  }
}