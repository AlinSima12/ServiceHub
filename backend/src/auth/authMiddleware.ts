import { Context, Next } from "koa";
import Service from "../service/service";
import { getLogger } from "../utils/utils";

export async function createAuthMiddleware(
  service: Service
): Promise<(ctx: Context, next: Next) => Promise<void>> {
  return async (ctx: Context, next: Next) => {
    const token = ctx.headers.authorization?.split(" ")[1];

    if (!token) {
      ctx.status = 401;
      ctx.body = { message: "Unauthorized" };
      return;
    }

    const decodedToken = service.verifyToken(token);

    if (!decodedToken || typeof decodedToken === "string") {
      ctx.status = 401;
      ctx.body = { message: "Unauthorized" };
      return;
    }

    const username = (decodedToken as any).username;

    if (!service.checkLoggedIn(token)) {
      ctx.status = 401;
      ctx.body = { message: "Unauthorized" };
      return;
    }

    ctx.state.username = username;
    ctx.state.token = token;

    await next();
  };
}
