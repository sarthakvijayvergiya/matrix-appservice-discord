export interface IDiscordStore {
   Init(overrideSchema: number): Promise<void>;
   Close(): void;
   AddUserToken(userId: string, discordId: string, token: string): Promise<any>;
   DeleteUserToken(discordId: string): Promise<null>;
   GetToken(discordId: string): Promise<string>;
   GetUserDiscordIds(userId: string): Promise<string[]>;
   GetDmRoom(discordId: string, discordChannel: string): Promise<string>;
   SetDmRoom(discordId: string, discordChannel: string, roomId: string): Promise<null>;
   Get<T extends IDbData>(dbType: {new(): T; }, params: any): Promise<T|null>;
   Insert<T extends IDbData>(data: T): Promise<Error>;
   Update<T extends IDbData>(data: T): Promise<Error>;
   Delete<T extends IDbData>(data: T): Promise<Error>;
}

export const CURRENT_SCHEMA = 7;
