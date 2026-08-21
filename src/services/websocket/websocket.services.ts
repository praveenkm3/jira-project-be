import type { WebSocket } from "ws";
import { decryptToken } from "../../utils/hashCookie.ts";
import { validateAccessToken } from "../../utils/tokens.ts";  

const userSockets = new Map<string, WebSocket>();

export function addConnection(userId: string, socket: WebSocket) {
  userSockets.set(userId, socket);
}

export function getConnections(userId: string) {
  return userSockets.get(userId);
}
export function removeConnection(userId: string) {
  return userSockets.delete(userId);
}

export async function authenticateWebsocket(cookieHeader: string) {
  const accessToken =
    cookieHeader
      ?.split(";")
      .find((cookie) => cookie.trim().startsWith("accessToken="))
      ?.split("=")[1] ?? "";
  const origin_token = decodeURIComponent(accessToken);
  const access_token_decrypt = await decryptToken(origin_token);
  const validateUser = validateAccessToken(access_token_decrypt);
  if (validateUser[0]) {
    return validateUser[1] ? validateUser[1].id : "";
  } else {
    return null;
  }
}

export function sendNotificationToUser(
  userId: string,
  notification: {
    notification_id: string;
    message: string;
    is_read: boolean;
    createdAt: Date;
  }
) {
  const socket = getConnections(userId);

  if (!socket) {
    return;
  }
  socket.send(
    JSON.stringify({
      type: "NEW_NOTIFICATION",
      notification,
    })
  );
}