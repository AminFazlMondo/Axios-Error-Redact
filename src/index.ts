import {AxiosError} from 'axios'

export class AxiosErrorRedactor {
  redactRequestData: boolean
  redactResponseData: boolean
  redactQueryDate: boolean

  constructor(redactRequestData = true, redactResponseData = true, redactQueryDate = true) {
    this.redactQueryDate = redactQueryDate
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
    this.redactQueryDate = false
    return this
  }

  redactError(error: AxiosError | null | undefined): (AxiosError | null | undefined) {
    if (!error || !error.isAxiosError)
      return
  }
}