export interface AxiosErrorRedactorOptions {
  /**
   * whether to redact request data
   * @default true
   */
  readonly redactRequestDataEnabled?: boolean;

  /**
   * whether to redact response data
   */
  readonly redactResponseDataEnabled?: boolean;

  /**
   * whether to redact query data
   */
  readonly redactQueryDataEnabled?: boolean;
}

/**
 * Redacted response of Axios error
 */
export interface HttpErrorResponse {
  readonly message: string;
  readonly fullURL: string;
  readonly response: {
    readonly statusCode?: number;
    readonly statusMessage: string;
    readonly data: unknown;
  };
  readonly request: {
    readonly baseURL: string;
    readonly path: string;
    readonly method: string;
    readonly data: unknown;
  };
}