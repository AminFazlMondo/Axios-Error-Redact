import axios from 'axios'
import {expect} from 'chai'
import {createErrorInterceptor, HttpErrorResponse, redactedKeyword} from '../src/index'

describe('Simple interceptor', () => {
  const baseURL = 'https://reqres.in/api'
  const instance = axios.create({baseURL})
  instance.interceptors.response.use(undefined, createErrorInterceptor())

  it('Should return details for bad request response', async () => {
    const url = 'register'
    const response = await instance.post(url, {email: 'sydney@fife'}).catch(e => e)

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
    }
    expect(response).to.deep.equal(expectedResponse)
  })
})