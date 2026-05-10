import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.PORT, () => {
  // Intentional startup log for local demo and cloud tunnel workflows.
  console.log(`Sales System API listening on port ${env.PORT}`);
});
