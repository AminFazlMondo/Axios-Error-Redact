import {expect} from 'chai'
import {HttpErrorResponse, isHttpErrorResponse} from '../src/index'

describe('Type Predicate', () => {

  it('Should not satisfy for undefined', async () => {
    expect(isHttpErrorResponse(undefined)).to.be.false
  })

  it('Should not satisfy for null', async () => {
    expect(isHttpErrorResponse(null)).to.be.false
  })

  it('Should not satisfy for empty object', async () => {
    expect(isHttpErrorResponse({})).to.be.false
  })

  it('Should not satisfy for random object', async () => {
    expect(isHttpErrorResponse({foo: 'bar'})).to.be.false
  })

  it('Should satisfy for object with false flag', async () => {
    const input= {
      fullURL: 'stub-full-url',
      isErrorRedactedResponse: false,
      message: 'stub-message',
      request: {
        baseURL: 'stub-base-url',
        data: 'stub-data',
        method: 'stub-method',
        path: 'stub-path',
      },
      response: {
        data: 'stub-data',
        statusCode: 200,
        statusMessage: 'stub-status-message',
      },

    }
    expect(isHttpErrorResponse(input)).to.be.false
  })

  it('Should satisfy for object', async () => {
    const input: HttpErrorResponse= {
      fullURL: 'stub-full-url',
      isErrorRedactedResponse: true,
      message: 'stub-message',
      request: {
        baseURL: 'stub-base-url',
        data: 'stub-data',
        method: 'stub-method',
        path: 'stub-path',
      },
      response: {
        data: 'stub-data',
        statusCode: 200,
        statusMessage: 'stub-status-message',
      },

    }
    expect(isHttpErrorResponse(input)).to.be.true
  })
})