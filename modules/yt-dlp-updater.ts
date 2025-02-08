import { exists } from "https://deno.land/std/fs/mod.ts";
import jsonfile from "npm:jsonfile";
import { ReleaseAsset } from "../types.ts";
import { downloadLatestYTDLP } from "./download-latest-yt-dlp.ts";
import InputLoop from "https://deno.land/x/input@2.0.4/index.ts";

const input = new InputLoop();

export const YTDLPUpdater = async () => {
    console.log("Check for yt-dlp update...");
    let res;
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
    }
    const latestAssetData = res?.assets.find(
        (asset: ReleaseAsset) => asset.name === "yt-dlp.exe"
    );

    if (!(await exists("./latest-dlp.json"))) {
        await jsonfile.writeFile("./latest-dlp.json", latestAssetData);

        if (!(await exists("./yt-dlp.exe"))) {
            console.log("YT DLP not found, downloading latest version...");
            await downloadLatestYTDLP(latestAssetData);
        }
    } else {
        const currentAssetData = await jsonfile.readFile("./latest-dlp.json");
        if (currentAssetData.node_id !== latestAssetData.node_id) {
            console.log("New version of yt-dlp is available. Downloading...");
            await jsonfile.writeFile("./latest-dlp.json", latestAssetData);
            await downloadLatestYTDLP(latestAssetData);
        } else {
            console.log("You have the latest version of YT DLP");
        }
    }
};
