export interface AsyncContext {

}


export interface AsyncRequest {

}

export interface AsyncResponse {

}

export interface AsyncRequest {
    setTimeoutForWait(timeout: number): void;
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    response(callback: (context: AsyncResponse) => void): void;
    stream(): TransformStream<AsyncRequest, AsyncResponse>;
    send(data: AsyncRequest): Promise<void>;
    sendResponse(data: AsyncRequest, waitFor: (msg: AsyncResponse) => boolean): Promise<AsyncResponse>;
}