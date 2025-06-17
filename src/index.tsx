import "@abraham/reflection";
import { fromHono } from "chanfana";
import { Hono } from "hono";
import { register as registerApi } from "./handler/api/index";
import { renderer } from "./renderer";

const app = new Hono();
app.use(renderer);

const openapi = fromHono(app, {
  schema: {
    info: {
      title: "CCIP Serverless API",
      version: "1.0.0",
    },
  },
});

registerApi(openapi);

app.get("/", (c) => {
  return c.render(<p>CCIP Serverless</p>);
});

export default app;
