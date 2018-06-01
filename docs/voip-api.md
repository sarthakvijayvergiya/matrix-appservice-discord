# VOIP API

(This document is subject to change and really is a braindump of thoughts about how we would do VOIP with a voice bridge)

## Voice Data Protocol (VDP)

The discord bridge receives and transmits voice over a single stream, for all intents and purposes. To that end, the packet protocol can be quite light.

```json
{
  "r":"!qPNOnUsNsZrToFZqxB:half-shot.uk",
  "d": [binary voice data],
  "i": incrementing integer from the point of channel creation
}
```

Ideally, something like MessagePack would be used since it has native support of binary data. This should be sent over an open UDP connection to and from the bridge.

## Signalling

1. A channel in this context is a new or existing UDP address:port combo assigned to one or more rooms that use the VDP protocol.

2. Event Format TBD, but will contain a roomid, format and version information at the very least.

3. Marked would mean the room would have a state flag set, presumably. It's implied that the room will be created if it doesn't exist or either bridge is not in the room.

Signalling would be done in a marked ^3 room between the discord bridge and the voice bridge. When the voice bridge starts a new call in a room, it should request the Discord bridge to open a new UDP address:port to send data packets to. The bridge will respond with a address:port (which may or may not be in use already) and in return the voice bridge should share its own address:port combination.


* Voice call is started in a room. The room is bridged to discord (how do we tell? We might need to set a state event).
* The voice bridge contacts the discord bridge privately to ask for a channel to be opened for the roomid. ^2
* The discord bridge will reply with a channel^1, or reject for a number of reasons:
  * The discord bridge is no longer/ is not bridged to the room.
  * The discord bridge doesn't have the capability to do calls.
  * The discord bridge does not have permissions to open a call.
  * The discord bridge is out of capacity for calls.
  * Another discord limitation.
* The voice bridge should respond with its own channel, and begin sending voice packets and expect to receive them.
* If either channel breaks at any point, this should be signalled in the room and renegotiated.

## Extra information

Things like speaking indicators should be done outside of this API. For the Matrix side, clients should send their own speaking indicator. The discord bridge will also do this. Mute/Deaf indicators on Discord would also be sent as state events.
