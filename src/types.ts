export interface AxiosErrorRedactorOptions {
  /**
   * whether to redact request data
   * @default true
   */
  readonly redactRequestDataEnabled?: boolean;

  /**
   * whether to redact response data
   * @default true
   */
  readonly redactResponseDataEnabled?: boolean;

  /**
   * whether to redact query data
   * @default true
   */
  readonly redactQueryDataEnabled?: boolean;
}

/**
 * Redacted response of Axios error
 */
export interface HttpErrorResponse {
  /**
   * whether the response is redacted
   */
  readonly isErrorRedactedResponse: true;

  /**
   * error message
   */
  readonly message: string;

  /**
   * full url of the request
   */
  readonly fullURL: string;

  /**
   * response details
   */
  readonly response: {

    /**
     * status code of the response
     */
    readonly statusCode?: number;

    /**
     * status message of the response
     */
    readonly statusMessage: string;

    /**
     * response data, redacted if set to true
     */
    readonly data: unknown;
  };
  readonly request: {
    /**
     * base url of the request
     */
    readonly baseURL: string;

    /**
     * path of the request
     */
    readonly path: string;

    /**
     * method of the request
     */
    readonly method: string;

    /**
     * request data, redacted if set to true
     */
    readonly data: unknown;
  };
}