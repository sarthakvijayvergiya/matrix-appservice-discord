import { DiscordBot } from "./bot";
import {
    Bridge,
    RemoteRoom,
    MatrixRoom,
    thirdPartyLookup,
    thirdPartyProtocolResult,
    thirdPartyUserResult,
    thirdPartyLocationResult,
} from "matrix-appservice-bridge";
import { DiscordBridgeConfig } from "./config";

import * as Discord from "discord.js";
import * as log from "npmlog";
import * as Bluebird from "bluebird";
import { Util } from "./util";
import { Provisioner } from "./provisioner";

const ICON_URL = "https://matrix.org/_matrix/media/r0/download/matrix.org/mlxoESwIsTbJrfXyAAogrNxA";
const JOIN_DELAY = 6000;
const HTTP_UNSUPPORTED = 501;
const ROOM_NAME_PARTS = 2;
const AGE_LIMIT = 900000; // 15 * 60 * 1000
const PROVISIONING_DEFAULT_POWER_LEVEL = 50;
const PROVISIONING_DEFAULT_USER_POWER_LEVEL = 0;

export class ThirdPartyHandler {

    private discord: DiscordBot;
    private botUserId: string;

    constructor(discord: DiscordBot, botUserId: string) {
        this.discord = discord;
        this.botUserId = botUserId;
    }

    get Lookup(): thirdPartyLookup {
        return {
            protocols: ["discord"],
            getProtocol: this.GetProtocol.bind(this),
            getLocation: this.GetLocation.bind(this),
            parseLocation: this.ParseLocation.bind(this),
            getUser: this.GetUser.bind(this),
            parseUser: this.ParseUser.bind(this),
        };
    }

    public async GetProtocol(protocol: string): Promise<thirdPartyProtocolResult> {
        return {
            user_fields: ["username", "discriminator"],
            location_fields: ["guild_id", "channel_name"],
            field_types: {
                // guild_name: {
                //   regexp: "\S.{0,98}\S",
                //   placeholder: "Guild",
                // },
                guild_id: {
                    regexp: "[0-9]*",
                    placeholder: "",
                },
                channel_id: {
                    regexp: "[0-9]*",
                    placeholder: "",
                },
                channel_name: {
                    regexp: "[A-Za-z0-9_\-]{2,100}",
                    placeholder: "#Channel",
                },
                username: {
                    regexp: "[A-Za-z0-9_\-]{2,100}",
                    placeholder: "Username",
                },
                discriminator: {
                    regexp: "[0-9]{4}",
                    placeholder: "1234",
                },
            },
            instances: this.discord.GetGuilds().map((guild) => {
                return {
                    network_id: guild.id,
                    bot_user_id: this.botUserId,
                    desc: guild.name,
                    icon: guild.iconURL || ICON_URL, // TODO: Use icons from our content repo. Potential security risk.
                    fields: {
                        guild_id: guild.id,
                    },
                };
            }),
        };
    }

    public async GetLocation(protocol: string, fields: any): Promise<thirdPartyLocationResult[]> {
        log.info("MatrixRoomHandler", "Got location request ", protocol, fields);
        const chans = this.discord.SearchForChannels(fields.guild_id, fields.channel_name);
        return Promise.resolve(chans);
    }

    public async ParseLocation(alias: string): Promise<thirdPartyLocationResult[]> {
        return Promise.reject({err: "Unsupported", code: HTTP_UNSUPPORTED});
    }

    public GetUser(protocol: string, fields: any): Promise<thirdPartyUserResult[]> {
        return Promise.reject({err: "Unsupported", code: HTTP_UNSUPPORTED});
    }

    public ParseUser(userid: string): Promise<thirdPartyUserResult[]> {
        return Promise.reject({err: "Unsupported", code: HTTP_UNSUPPORTED});
    }
}