import {AxiosErrorRedactor} from '../index'
import axios from 'axios'

const redactor = new AxiosErrorRedactor()

it('Invalid URL', async () => {
  const response = await axios.get('Invalid-URL').catch(e => redactor.redactError(e))
  console.log('###DEBUG-response:', response)
})