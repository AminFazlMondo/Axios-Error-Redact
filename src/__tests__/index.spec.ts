import { AxiosErrorRedactor, HttpErrorResponse, redactedKeyword } from '../index'
import axios from 'axios'
import { expect, use } from 'chai'
import chaiExclude from 'chai-exclude'

use(chaiExclude);

const redactor = new AxiosErrorRedactor()

it('Should return details for invalid url request', async () => {
  const url = 'Invalid-URL'
  const response = await axios.get(url).catch(e => redactor.redactError(e))

  const expectedResponse: HttpErrorResponse = {
    baseUrl: '',
    fullUrl: url,
    path: url,
    message: 'Request failed with status code 400',
    response: {
      statusCode: 400,
      statusMessage: 'Bad Request'
    }
  }
  expect(response).excludingEvery('data').to.deep.equal(expectedResponse)
})

it('Should return details for invalid url request with base URL', async () => {
  const path = 'Invalid-URL'
  const baseURL = 'example.com'
  const instance = axios.create({
    baseURL
  })
  const response = await instance.get(path).catch(e => redactor.redactError(e))

  const expectedResponse: HttpErrorResponse = {
    baseUrl: baseURL,
    fullUrl: `${baseURL}/${path}`,
    path,
    message: 'Request failed with status code 400',
    response: {
      statusCode: 400,
      statusMessage: 'Bad Request'
    }
  }
  expect(response).excludingEvery('data').to.deep.equal(expectedResponse)
})

it('Should return same Error when request preparation failed', async () => {
  const path = 'Invalid-URL'
  const baseURL = 'example.com'
  const instance = axios.create({
    baseURL
  })

  const error = new Error('message')

  instance.interceptors.request.use(() => {
    throw error
  })

  const response = await instance.get(path).catch(e => redactor.redactError(e))

  const expectedResponse: HttpErrorResponse = {
    baseUrl: baseURL,
    fullUrl: `${baseURL}/${path}`,
    path,
    message: 'Request failed with status code 400',
    response: {
      statusCode: 400,
      statusMessage: 'Bad Request'
    }
  }
  expect(response).to.be.equal(error)
})

it('Should redact details in query params of path', async () => {
  const url = 'Invalid-URL'
  const response = await axios.get(`${url}?secret=mySecret`).catch(e => redactor.redactError(e))
  const expectedResponse: HttpErrorResponse = {
    baseUrl: '',
    fullUrl: `${url}?${redactedKeyword}`,
    path: `${url}?${redactedKeyword}`,
    message: 'Request failed with status code 400',
    response: {
      statusCode: 400,
      statusMessage: 'Bad Request'
    }
  }
  expect(response).excludingEvery('data').to.deep.equal(expectedResponse)
})

it('Should redact details in query params', async () => {
  const url = 'Invalid-URL'
  const response = await axios.get(url, {params: { secret: 'my-secret' }}).catch(e => redactor.redactError(e))
  const expectedResponse: HttpErrorResponse = {
    baseUrl: '',
    fullUrl: `${url}?${redactedKeyword}`,
    path: url,
    message: 'Request failed with status code 400',
    response: {
      statusCode: 400,
      statusMessage: 'Bad Request'
    }
  }
  expect(response).excludingEvery('data').to.deep.equal(expectedResponse)
})

it('Should redact details in fragment params of path', async () => {
  const url = 'Invalid-URL'
  const response = await axios.get(`${url}#mySecret`).catch(e => redactor.redactError(e))
  const expectedResponse: HttpErrorResponse = {
    baseUrl: '',
    fullUrl: url,
    path: `${url}#${redactedKeyword}`,
    message: 'Request failed with status code 400',
    response: {
      statusCode: 400,
      statusMessage: 'Bad Request'
    }
  }
  expect(response).excludingEvery('data').to.deep.equal(expectedResponse)
})
