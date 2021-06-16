import { HttpClient } from './HttpClient';
export class BscscanService extends HttpClient {
  calls: Date[] = [];

  constructor(route: string, private _apiKey: string) {
    super(route)
  }

  async get(module: string, action: string, ...more: { key: string, value: string }[]): Promise<any> | never {
    await this.canCallApi();
    let uri = `?module=${module}&action=${action}`
    more.forEach((entry) => { uri += `&${entry.key}=${entry.value}` })
    uri += '&apiKey=' + this._apiKey
    return this.instance.get(uri).then((response: any) => { if (response.message == 'NOTOK') { throw new Error(response.result) } return response.result })
  }

  // little bridle for api call (limited to 5 calls / sec / IP)
  async canCallApi(): Promise<boolean> {
    this.calls.push(new Date());
    if (this.calls.length > 5) {
      this.calls.shift();
    }
    return new Promise((resolve) => {
      if (this.calls.length == 5) {
        const lastCallDate: number = this.calls[this.calls.length - 1].getTime();
        const firstCallDate: number = this.calls[0].getTime()
        if ((lastCallDate - firstCallDate) <= 1000) {
          setTimeout(() => {
            resolve(true);
          }, 1000 - (lastCallDate - firstCallDate));
        }
        else {
          resolve(true);
        }
      }
      else {
        resolve(true);
      }
    });
  }
}