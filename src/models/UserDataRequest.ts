import { ServerConfig } from './ServerConfig';

export type UserDataRequest = {
  req: object,
  fileList: Array<string>,
  config: ServerConfig
}