export async function execSeparate(path: string, args: string[] = []) {
    const command = new Deno.Command("cmd", {
        args: ["/c", "start", path, ...args],
    });
    await command.output();
}
