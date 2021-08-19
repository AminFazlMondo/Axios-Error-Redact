# Axios-Error-Redact
Library to redact sensitive information from Axios errors.
This can be used as an response interceptor for axios instances, or can be used standalone.

# Getting started

```console
npm i axios-error-redact
```

## Interceptor usage

The redactor can be used in an interceptor to extract non-sensitive data from error and continue

```javascript
import axios from 'axios'
import {AxiosErrorRedactor} from 'axios-error-redact'

const instance = axios.create({baseURL: 'http://example.com'})

const redactor = new AxiosErrorRedactor()

function errorInterceptor(error: any): any {
  const redactedError = redactor.redactError(error)
  // You may want to add more logic here; for example logging
  return Promise.reject(redactedError)
}

instance.interceptors.response.use(undefined, errorInterceptor)

// instance.get()

```

## Standalone usage

The library can be used on its own without using any interceptor as well.

```javascript
import axios from 'axios'
import {AxiosErrorRedactor} from 'axios-error-redact'

const redactor = new AxiosErrorRedactor()

const result = axios.get('http://example.com')
  .catch(error => redactor.redactError(error))

```

## API

### Constructor

The redactor object can be initiated with some defaults; in which all of the sensitive data will be redacted (request, response, query)

```javascript
import {AxiosErrorRedactor} from 'axios-error-redact'

const redactor = new AxiosErrorRedactor()

```

The constructor also accepts boolean values to enable or disable these

```javascript
import {AxiosErrorRedactor} from 'axios-error-redact'

const redactor = new AxiosErrorRedactor(
  false, //redactRequestData
  false, //redactResponseData
  false, //redactQueryData
  )

```

### Main Function

The main function that can be called on the initiated object is `redactError` which accepts the error as the input and returns the redacted information in and object of type `HttpErrorResponse`

```javascript
import axios from 'axios'
import {AxiosErrorRedactor} from 'axios-error-redact'

const redactor = new AxiosErrorRedactor()

const result = axios.get('http://example.com')
  .catch(error => redactor.redactError(error))

```

### Changing Flags

There are three functions that can be used and chained after the initiated object in order to change what sort of data should be skipped to be redacted.

```javascript
import {AxiosErrorRedactor} from 'axios-error-redact'

const redactor = new AxiosErrorRedactor().skipRequestData().skipQueryData()

```

### Response

The redact library will extract information from axios error and return an object with following details.

```javascript
HttpErrorResponse {
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
```

If the error is not an axios error, then the same error will be returned.
