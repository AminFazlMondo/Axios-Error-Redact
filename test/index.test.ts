import axios from 'axios';
import { expect } from 'chai';
import { GenericContainer, Wait } from 'testcontainers';
import { WireMock, IWireMockResponse } from 'wiremock-captain';
import { AxiosErrorRedactor, HttpErrorResponse, redactedKeyword } from '../src/index';

const redactor = new AxiosErrorRedactor();

context('Invalid URL', ()=> {

  let hostName: string;
  let port: number;
  let wireMockCaptain: WireMock;

  before(async () => {
    const wireMockContainer = new GenericContainer('wiremock/wiremock')
      .withExposedPorts(8080)
      .withWaitStrategy(Wait.forListeningPorts());
    const wireMockStartedContainer = await wireMockContainer.start();
    hostName = wireMockStartedContainer.getHost();
    port = wireMockStartedContainer.getMappedPort(8080);
    wireMockCaptain = new WireMock(`http://${hostName}:${port}`);

    const notFoundResponse: IWireMockResponse = {
      status: 404,
      body: {
        code: 404,
        description: 'Not Found',
      },
    };

    await wireMockCaptain.register(
      {
        endpoint: '/404',
        method: 'GET',
      },
      notFoundResponse,
    );
    await wireMockCaptain.register(
      {
        endpoint: '/404?secret=mySecret',
        method: 'GET',
      },
      notFoundResponse,
    );
    await wireMockCaptain.register(
      {
        endpoint: '/404#mySecret',
        method: 'GET',
      },
      notFoundResponse,
    );
    await wireMockCaptain.register(
      {
        endpoint: '/404',
        method: 'POST',
      },
      notFoundResponse,
    );
  });

  it('Should return details for invalid url request', async () => {

    const url = `http://${hostName}:${port}/404`;
    const response = await axios.get(url).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
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
    const path = '404';
    const baseURL = `http://${hostName}:${port}`;
    const instance = axios.create({
      baseURL,
    });
    const response = await instance.get(path).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}/${path}`,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
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
    const baseURL = 'http://example.com';
    const instance = axios.create({
      baseURL,
      headers: {
        'x-api-key': 'reqres-free-v1',
      },
    });

    const error = new Error('message');

    instance.interceptors.request.use(() => {
      throw error;
    });

    const response = await instance.get(path).catch(e => redactor.redactError(e));

    expect(response).to.be.equal(error);
  });

  it('Should redact details in query params of path', async () => {
    const url = `http://${hostName}:${port}/404`;
    const response = await axios.get(`${url}?secret=mySecret`).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${url}?${redactedKeyword}`,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
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
    const url = `http://${hostName}:${port}/404`;
    const response = await axios.get(url, { params: { secret: 'mySecret' } }).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${url}?${redactedKeyword}`,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
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
    const url = `http://${hostName}:${port}/404`;
    const response = await axios.get(`${url}#mySecret`).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: `${url}#${redactedKeyword}`,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
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
    const url = `http://${hostName}:${port}/404?secret=mySecret`;
    const redactor2 = new AxiosErrorRedactor().skipQueryData();
    const response = await axios.get(url).catch(e => redactor2.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
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
    const url = `http://${hostName}:${port}/404`;
    const response = await axios.post(url, { foo: { bar: 'my-secret' } }).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
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

  it('Should redact request data, with null value', async () => {
    const url = `http://${hostName}:${port}/404`;
    const response = await axios.post(url, { foo: { bar: 'my-secret', test: null } }).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
      },
      request: {
        baseURL: '',
        path: url,
        method: 'post',
        data: {
          foo: {
            bar: redactedKeyword,
            test: null,
          },
        },
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });

  it('Should redact request data, array of values', async () => {
    const url = `http://${hostName}:${port}/404`;
    const response = await axios.post(url, [{ foo: 'foo' }, { bar: 1 }]).catch(e => redactor.redactError(e));
    const expectedResponse: HttpErrorResponse = {
      fullURL: url,
      isErrorRedactedResponse: true,
      message: 'Request failed with status code 404',
      response: {
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          code: redactedKeyword,
          description: redactedKeyword,
        },
      },
      request: {
        baseURL: '',
        path: url,
        method: 'post',
        data: [
          {
            foo: redactedKeyword,
          },
          {
            bar: redactedKeyword,
          },
        ],
      },
    };
    expect(response).to.deep.equal(expectedResponse);
  });
});

describe('Valid Remote URL', () => {
  const baseURL = 'https://reqres.in/api';
  const apiKey = process.env.REQRES_API_KEY;
  if (!apiKey) {
    throw new Error('REQRES_API_KEY environment variable is not set');
  }
  const instance = axios.create({
    baseURL,
    headers: {
      'x-api-key': apiKey,
    },
  });

  it('Should return details for not found response', async () => {
    const url = '/users/23';
    const response = await instance.get(url).catch(e => redactor.redactError(e));

    const expectedResponse: HttpErrorResponse = {
      fullURL: `${baseURL}${url}`,
      isErrorRedactedResponse: true,
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
      isErrorRedactedResponse: true,
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
      isErrorRedactedResponse: true,
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
      isErrorRedactedResponse: true,
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
      isErrorRedactedResponse: true,
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

