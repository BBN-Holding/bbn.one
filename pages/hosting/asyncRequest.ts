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
} | {
    type: MessageType.JsonObjectData,
    unparsedData: string;
} | {
    type: MessageType.BinaryData,
    unparsedData: string;
};

export interface HmConnection {
    channel: (moduleId: string) => Promise<ReadableStream<HmMessage> & {
        request: (triggerId: string, data: Record<string, string>) => Promise<HmMessage>;
        announce: (triggerId: string, data: Record<string, string>) => Promise<void>;
    }>;
    subscribe: (subscription: string) => Promise<ReadableStream<HmPublishMessage>>;
}


async function connect(domain: string, options?: {
    type?: 'secure' | 'insecure';
    getToken?: () => string;
}): Promise<HmConnection> {
    await "";
    return undefined!;
}


const connection = await connect("bbn.one");


const channel = await connection.channel("@bbn/hosting/sidecar");

for await (const message of channel) {
    if (message.type == MessageType.ChannelOpen) {
    }
}

for await (const iterator of await connection.subscribe("@bbn/hosting/sidecar/ressourceInfo")) {
    console.log(iterator);
}

// Insecure
// Client sends ulid:@bbn/hosting/sidecar
// Servers sends ulid:MessageType { ChannelOpen } or ulid:MessageType{ ChannelOpenFailed }:{ "error": "Requires Secure Endpoint" }

// Client makes ulid => ulid:
// ulid:MessageType