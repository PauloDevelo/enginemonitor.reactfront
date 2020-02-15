import * as log from 'loglevel';

// eslint-disable-next-line no-unused-vars
import axios, { CancelToken, CancelTokenSource } from 'axios';
import axiosRetry from 'axios-retry';

import HttpError from '../http/HttpError';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';

export type Config = {
  headers: {
      Authorization: string
  };
  timeout?: number;
};

export interface IHttpProxy{
    postImage(url: string, image:ImageModel, imageData:Blob, thumbnailData: Blob): Promise<{ image:ImageModel }>;
    post(url: string, data: any): Promise<any>;
    deleteReq(url: string): Promise<any>;
    get(url: string, cancelToken?: CancelToken | undefined): Promise<any>;
    setConfig(config: Config | undefined): void;
    createCancelTokenSource(): CancelTokenSource;
}

function processError(error: any) {
  log.error(error);

  let data:any = { message: error.message };
  if (error.response) {
    if (error.response.data) {
      if (error.response.data.errors) {
        data = error.response.data.errors;
      } else {
        data = error.response.data;
      }
    }
  }

  throw new HttpError(data, error);
}

class HttpProxy implements IHttpProxy {
    private config:Config | undefined;

    constructor() {
      axiosRetry(axios, { retries: 1, retryDelay: () => 1000 });
    }

    setConfig(config: Config) {
      this.config = { ...config };
    }

    postImage = async (url: string, image:ImageModel, imageData:Blob, thumbnailData: Blob):Promise<{ image: ImageModel }> => {
      const imgFormObj = new FormData();
      imgFormObj.append('name', image.name);
      imgFormObj.append('imageData', imageData, `${image._uiId}.jpeg`);
      imgFormObj.append('thumbnail', thumbnailData, `thumbnail_${image._uiId}.jpeg`);
      imgFormObj.append('parentUiId', image.parentUiId);
      imgFormObj.append('_uiId', image._uiId);

      return this.post(url, imgFormObj);
    }

    // eslint-disable-next-line consistent-return
    post = async (url: string, data: any) => {
      try {
        const response = await axios.post(url, data, this.config);
        return response.data;
      } catch (error) {
        processError(error);
      }
    }

    // eslint-disable-next-line consistent-return
    deleteReq = async (url: string) => {
      try {
        const response = await axios.delete(url, this.config);
        return response.data;
      } catch (error) {
        processError(error);
      }
    }

    // eslint-disable-next-line consistent-return
    get = async (url: string, cancelToken: CancelToken | undefined = undefined) => {
      try {
        const config = cancelToken ? ({ cancelToken, ...this.config }) : this.config;
        const response = await axios.get(url, config);
        return response.data;
      } catch (error) {
        if (error instanceof axios.Cancel) {
          log.info(error.message);
        } else {
          processError(error);
        }
      }
    }

    createCancelTokenSource = () => axios.CancelToken.source()
}

const httpProxy:IHttpProxy = new HttpProxy();
export default httpProxy;
