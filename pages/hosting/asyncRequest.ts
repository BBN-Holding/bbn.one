export interface HmPublishMessage {
    data: HmMessage;
}

export enum MessageType {
    ChannelOpen,
    ChannelOpenFailed,
    ChannelClose,
    JsonObjectData,
    BinaryData,
}

export type HmMessage = {
    type: MessageType.ChannelOpen;
    channelId: string;
    subscribe: (subscription: string) => ReadableStream<HmPublishMessage>;
    request: (triggerId: string, data: Record<string, string>) => Promise<HmMessage>;
    announce: (triggerId: string, data: Record<string, string>) => Promise<void>;
} | {
    type: MessageType.JsonObjectData,
    unparsedData: string;
} | {
    type: MessageType.BinaryData,
    unparsedData: string;
};

export interface HmConnection {
    channel: (moduleId: string) => ReadableStream<HmMessage>;
}


async function connect(domain: string, options?: {
    type?: 'secure' | 'unsecure';
    getToken?: () => string;
}): Promise<HmConnection> {
    await "";
    return {
        channel: () => new ReadableStream<HmMessage>()
    };
}


const connection = await connect("bbn.one");

for await (const message of connection.channel("@bbn/hosting/sidecar")) {
    if (message.type == MessageType.ChannelOpen) {
        for await (const iterator of message.subscribe("ressourceInfo")) {
            console.log(iterator);
        }
    }
}