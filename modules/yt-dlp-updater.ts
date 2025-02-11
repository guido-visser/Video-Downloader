import { exists } from "https://deno.land/std/fs/mod.ts";
import jsonfile from "npm:jsonfile";
import { ReleaseAsset } from "../types.ts";
import { downloadLatestYTDLP } from "./download-latest-yt-dlp.ts";
import InputLoop from "https://deno.land/x/input@2.0.4/index.ts";
import { getYTDLPVersion } from "../execCommand.ts";

const input = new InputLoop();

export const YTDLPUpdater = async () => {
    console.log("Check for yt-dlp update...");
    let res: { assets: ReleaseAsset[] } = null;
    try {
        const call = await fetch(
            "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest"
        );
        res = await call.json();
    } catch (e) {
        console.log("GitHub didn't respond as expected");
        console.log(e);
        await input.wait();
    }
    if (!res) {
        console.log("Something went wrong with checking for updates");
        await input.wait();
    }
    const latestAssetData: ReleaseAsset = res?.assets.find(
        (asset) => asset.name === "yt-dlp.exe"
    );

    try {
        let downloaded = false;
        if (!(await exists("./yt-dlp.exe"))) {
            console.log("YT DLP not found, downloading latest version...");
            await downloadLatestYTDLP(latestAssetData);
            downloaded = true;
        }

        const currentVersion = await getYTDLPVersion();

        if (
            !downloaded &&
            latestAssetData.browser_download_url.indexOf(currentVersion) === -1
        ) {
            console.log("New version of yt-dlp is available. Downloading...");
            await jsonfile.writeFile("./latest-dlp.json", latestAssetData);
            await downloadLatestYTDLP(latestAssetData);
        } else {
            console.log("You have the latest version of YT DLP");
            console.clear();
        }
    } catch (e) {
        console.log("Something went wrong", e);
        await input.wait();
    }
};
