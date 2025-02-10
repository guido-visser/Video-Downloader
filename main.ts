import { execSeparate } from "./execCommand.ts";
import { YTDLPUpdater } from "./modules/yt-dlp-updater.ts";
import InputLoop from "https://deno.land/x/input@2.0.4/index.ts";

const input = new InputLoop();

async function main() {
    await YTDLPUpdater();
    const userInput = await input.question(
        "Enter Video URL(s) (comma separated):"
    );
    let urls = [userInput];
    if (userInput.indexOf(",") !== -1) {
        urls = userInput.split(",").map((url) => url.trim());
    }

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        await execSeparate("./yt-dlp.exe", [
            "-f",
            "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]",
            "-o",
            "./%(title)s.%(ext)s",
            "--merge-output-format",
            "mp4",
            url,
        ]);
    }
}

main().catch(console.error);
