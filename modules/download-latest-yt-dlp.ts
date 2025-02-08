import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
import { ReleaseAsset } from "../types.ts";

export const downloadLatestYTDLP = async (latestAssetData: ReleaseAsset) => {
    try {
        const fileObj = await download(latestAssetData.browser_download_url, {
            dir: "./",
            file: "yt-dlp.exe",
        });
        console.log("File download complete!");
        return fileObj;
    } catch (e) {
        console.log("Download failed", e);
    }
};
