import axios from 'axios';
import { expect } from 'chai';
import { AxiosErrorRedactor, HttpErrorResponse, redactedKeyword } from '../src/index';

const redactor = new AxiosErrorRedactor();

context('localhost', ()=> {
  it('Should return details for invalid url request', async () => {
    const url = 'Invalid-URL';
    const response = await axios.get(url).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL: '',
        path: url,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should return details for invalid url request with base URL', async () => {
    const path = 'Invalid-URL';
    const baseURL = 'example.com';
    const instance = axios.create({
      baseURL,
    });
    const response = await instance.get(path).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}/${path}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL,
        path,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should return same Error when request preparation failed', async () => {
    const path = 'Invalid-URL';
    const baseURL = 'example.com';
    const instance = axios.create({
      baseURL,
    });

    const error = new Error('message');

    instance.interceptors.request.use(() => {
      throw error;
    });

    const response = await instance.get(path).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}/${path}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL,
        path,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.be.equal(error);
  });

  it('Should redact details in query params of path', async () => {
    const url = 'Invalid-URL';
    const response = await axios.get(`${url}?secret=mySecret`).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${url}?${redactedKeyword}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL: '',
        path: `${url}?${redactedKeyword}`,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should redact details in query params', async () => {
    const url = 'Invalid-URL';
    const response = await axios.get(url, { params: { secret: 'my-secret' } }).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${url}?${redactedKeyword}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL: '',
        path: url,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should redact details in fragment params of path', async () => {
    const url = 'Invalid-URL';
    const response = await axios.get(`${url}#mySecret`).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${url}#${redactedKeyword}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL: '',
        path: `${url}#${redactedKeyword}`,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should skip redact details in query params if configured', async () => {
    const url = 'Invalid-URL?secret=mySecret';
    const redactor2 = new AxiosErrorRedactor().skipQueryData();
    const response = await axios.get(url).catch(e => redactor2.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL: '',
        path: url,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should redact request data', async () => {
    const url = 'Invalid-URL';
    const response = await axios.post(url, { foo: { bar: 'my-secret' } }).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: redactedKeyword,
      },
      request: {
        baseURL: '',
        path: url,
        method: 'post',
        data: {
          foo: {
            bar: redactedKeyword,
          },
        },
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });
});

describe('remote', function() {
  this.slow(3000);
  const baseURL = 'https://reqres.in/api';
  const instance = axios.create({ baseURL });

  it('Should return details for not found response', async () => {
    const url = '/users/23';
    const response = await instance.get(url).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}${url}`,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {},
      },
      request: {
        baseURL,
        path: url,
        method: 'get',
        data: undefined,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should return details for bad request response', async () => {
    const url = 'register';
    const response = await instance.post(url, { email: 'sydney@fife' }).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}/${url}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          error: redactedKeyword,
        },
      },
      request: {
        baseURL,
        path: url,
        method: 'post',
        data: {
          email: redactedKeyword,
        },
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should skip redact details in response data if configured', async () => {
    const url = 'register';
    const redactor2 = new AxiosErrorRedactor().skipResponseData();
    const response = await instance.post(url, { email: 'sydney@fife' }).catch(e => redactor2.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}/${url}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          error: 'Missing password',
        },
      },
      request: {
        baseURL,
        path: url,
        method: 'post',
        data: {
          email: redactedKeyword,
        },
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should skip redact details in request data if configured', async () => {
    const url = 'register';
    const payload = { email: 'sydney@fife' };
    const redactor2 = new AxiosErrorRedactor().skipRequestData();
    const response = await instance.post(url, payload).catch(e => redactor2.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}/${url}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          error: redactedKeyword,
        },
      },
      request: {
        baseURL,
        path: url,
        method: 'post',
        data: payload,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should skip redact details in request and response data if configured', async () => {
    const url = 'register';
    const payload = { email: 'sydney@fife' };
    const redactor2 = new AxiosErrorRedactor().skipRequestData().skipResponseData();
    const response = await instance.post(url, payload).catch(e => redactor2.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}/${url}`,
      message: 'Request failed with status code 400',
      response: {
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          error: 'Missing password',
        },
      },
      request: {
        baseURL,
        path: url,
        method: 'post',
        data: payload,
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });
});

