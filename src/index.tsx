import "@abraham/reflection";

import { fromHono } from "chanfana";
import { Hono } from "hono";

import "@/container";
import { register as registerApi } from "@/handler/api";
import { renderer } from "./renderer";

const app = new Hono<{ Bindings: Env }>();
app.use(renderer);

const openapi = fromHono(app, {
  schema: {
    info: {
      title: "CCIP Serverless API",
      version: "0.1.0",
    },
  },
});

registerApi(openapi);

app.get("/", (c) => {
  return c.render(<p>CCIP Serverless</p>);
});

export default app;
export { EventDatabase } from "@/infra/EventDatabase";
