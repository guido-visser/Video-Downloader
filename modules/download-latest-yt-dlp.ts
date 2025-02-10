import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
import { ReleaseAsset } from "../types.ts";
import InputLoop from "https://deno.land/x/input@2.0.4/index.ts";

const input = new InputLoop();

export const downloadLatestYTDLP = async (latestAssetData: ReleaseAsset) => {
    try {
        const fileObj = await download(latestAssetData.browser_download_url, {
            dir: "./",
            file: "yt-dlp.exe",
        });
        console.log("File download complete!");
        console.clear();
        return fileObj;
    } catch (e) {
        console.log("Download failed", e);
        await input.wait();
    }
};
