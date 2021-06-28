import {AxiosErrorRedactor, redactedKeyword} from '../index'
import axios, {AxiosError, AxiosResponse} from 'axios'
import {expect} from 'chai'

const redactor = new AxiosErrorRedactor()

function extractAxiosError(response: AxiosError | AxiosResponse | null | undefined): AxiosError {
  if (response && 'isAxiosError' in response)
    return response as AxiosError

  throw new Error('Is not a Axios error')
}

function shouldNotContainRequestData(error: AxiosError): void {
  expect(error.config.data).to.be.undefined
  expect(error.request.data).to.be.undefined
}

function shouldRedactContainRequestData(error: AxiosError): void {
  expect(error.config.data).to.be.equal(redactedKeyword)
  expect(error.response?.config.data).to.be.equal(redactedKeyword)
}

it('Authorized with bearer token', async () => {
  const auth = 'Bearer myToken'
  const payload = {foo: 'bar'}
  const response = await axios.put('Invalid-URL', payload, {
    headers:{
      Authorization: auth
    }
  }).catch(e => redactor.redactError(e))
  const error = extractAxiosError(response)
  shouldRedactContainRequestData(error)
  expect(error.config.headers.Authorization).to.be.equal(redactedKeyword)
  expect(error.request.connection._httpMessage._header).to.not.include(auth)
})



it('Basic Auth', async () => {
  const username = 'stub-username'
  const password = 'stub-password'
  const response = await axios.get('Invalid-URL', {
    auth: {
      username,
      password
    }
  }).catch(e => redactor.redactError(e))
  const error = extractAxiosError(response)
  expect(error.config.auth?.username).to.be.equal(redactedKeyword)
  expect(error.config.auth?.password).to.be.equal(redactedKeyword)
  expect(error.request.connection._httpMessage._header).to.not.include(username)
  expect(error.request.connection._httpMessage._header).to.not.include(password)
})

it('No request body', async () => {
  const response = await axios.get('Invalid-URL').catch(e => redactor.redactError(e))
  const error = extractAxiosError(response)
  shouldNotContainRequestData(error)
})

it('Request body', async () => {
  const auth = 'Bearer myToken'
  const payload = {foo: 'bar'}
  const response = await axios.post('Invalid-URL', payload, {
    headers:{
      Authorization: auth
    }
  }).catch(e => redactor.redactError(e))
  const error = extractAxiosError(response)
  shouldRedactContainRequestData(error)
})

it('Query params', async () => {
  const response = await axios.get('Invalid-URL?secret=mySecret').catch(e => redactor.redactError(e))
  const error = extractAxiosError(response)
  expect(error.config.url).to.be.equal('Invalid-URL?<REDACTED>')
  expect(error.request.path).to.be.equal('Invalid-URL?<REDACTED>')
  expect(error.request.res.responseUrl).to.include('Invalid-URL?<REDACTED>')
})

it('Fragment params', async () => {
  const secret = 'stubSecret'
  const response = await axios.get(`Invalid-URL#${secret}`).catch(e => redactor.redactError(e))
  const error = extractAxiosError(response)
  expect(error.config.url).to.be.equal('Invalid-URL#<REDACTED>')
  expect(error.request.path).to.not.include(secret)
  expect(error.request.res.responseUrl).to.not.include(secret)
})