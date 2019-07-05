import axios from "axios";
import axiosRetry from 'axios-retry';

import HttpError from '../http/HttpError'

export type Config = {
    headers: {
        Authorization: string
    }
};

export interface IHttpProxy{
    post(url: string, data: any): Promise<any>;
    deleteReq(url: string): Promise<any>;
    get(url: string): Promise<any>;
    setConfig(config: Config | undefined): void;
}

class HttpProxy implements IHttpProxy{
    private config:Config | undefined;

    constructor(){
        axiosRetry(axios, { retries: 1, retryDelay: () => 1000 });
    }

    setConfig(config: Config){
        this.config = config;
    }

    post = async (url: string, data: any) => {
        try{
            const response = await axios.post(url, data, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error);
        }
    }
    
    deleteReq = async (url: string) => {
        try{
            const response = await axios.delete(url, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error);
        }
    }

    get = async (url: string) => {
        try{
            const response = await axios.get(url, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error);
        }
    }

    processError(error: any){
        if(error){
            console.log( error );

            let data:any = { message: error.message};
            if(error.response){
                if(error.response.data){
                    if(error.response.data.errors){
                        data = error.response.data.errors;
                    }
                    else{
                        data = error.response.data;
                    }
                }
            }
            
            throw new HttpError(data);
        }
    }
}

const httpProxy:IHttpProxy = new HttpProxy();
export default httpProxy;
