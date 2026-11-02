import { runMediaUpload } from "./media/upload.ts";

process.exitCode = await runMediaUpload(process.argv.slice(2));
