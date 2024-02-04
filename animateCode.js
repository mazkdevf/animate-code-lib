/* 
      █████╗ ███╗   ██╗██╗███╗   ███╗ █████╗ ████████╗███████╗     ██████╗ ██████╗ ██████╗ ███████╗    ██████╗ ██████╗ ███╗   ███╗
     ██╔══██╗████╗  ██║██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝    ██╔════╝██╔═══██╗██╔══██╗██╔════╝   ██╔════╝██╔═══██╗████╗ ████║
     ███████║██╔██╗ ██║██║██╔████╔██║███████║   ██║   █████╗█████╗██║     ██║   ██║██║  ██║█████╗     ██║     ██║   ██║██╔████╔██║
     ██╔══██║██║╚██╗██║██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝╚════╝██║     ██║   ██║██║  ██║██╔══╝     ██║     ██║   ██║██║╚██╔╝██║
     ██║  ██║██║ ╚████║██║██║ ╚═╝ ██║██║  ██║   ██║   ███████╗    ╚██████╗╚██████╔╝██████╔╝███████╗██╗╚██████╗╚██████╔╝██║ ╚═╝ ██║
     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝

Creator of animate-code.com > https://www.youtube.com/watch?v=OXk6Eabu7uM "https://www.youtube.com/@joshtriedcoding"
This is a simple wrapper for the animate-code.com. It allows you to export code array to a video file. like you can in the website.

Here's how to use it:
```javascript
const animateCodeLib = require("./animateCode");
const animateCode = new animateCodeLib();

async function main() {
    console.clear();
    
    let decorativeFileName = "test.py";
    let slideContents = [
        "print('')",
        "print('Hello, World!')",
    ];

    slideContents = slideContents.map(slideContent => Buffer.from(slideContent).toString("base64"));

    await animateCode.automaticExport(decorativeFileName, slideContents);
}

main();
```

By running this script, a file with the name "{randomizedId}.mp4" will be generated in the same directory as the script itself.
*/

const fetch = require("node-fetch");
const fs = require("fs");
const cliProgress = require('cli-progress');

class animateCode {
    constructor() { }

    async pollExport(input, batch = 1) {
        input = `{"0":{"id":"${input}"}}`;

        const data = await this.request(`https://www.animate-code.com/api/trpc/pollExport?batch=${batch}&input=${encodeURIComponent(input)}`);
        const status = data[0].result.data.status;
        if (status === "processing" || status === "success") {
            return {
                status: status,
                url: data[0]?.result?.data?.url
            };
        } else {
            throw new Error("Unknown status: " + status);
        }
    }

    async export(decorativeFileName, slideContents = []) {
        const data = await this.request("https://www.animate-code.com/api/trpc/export?batch=1", {
            "0": {
                "slideContents": slideContents,
                "decorativeFileName": decorativeFileName
            }
        }, "POST");

        return {
            id: data[0].result.data.id,
            status: data[0].result.data.status
        };
    }

    async automaticExport(decorativeFileName, slideContents = [], batch = 1) {
        console.log('\n\n Starting automatic export...');
        const data = await this.export(decorativeFileName, slideContents);
        let id = data.id;
        console.log('\n\n Export started, polling for status...');

        let interval = setInterval(async () => {
            try {
                const data = await this.pollExport(id, batch);
                if (data.status === "success") {
                    clearInterval(interval);
                    console.log('\n\n Export successful!');
                    return this.downloadFile(data.url, id);
                } else {
                    console.log('\n Export still pending...');
                }
            } catch (err) {
                clearInterval(interval);
                console.log('\n\n Error during polling:', err);
            }
        }, 1500);
    }

    async downloadFile(url, id) {
        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(100, 0);

        const res = await fetch(url);
        const totalSize = Number(res.headers.get('content-length'));
        let downloadedSize = 0;

        const dataStream = res.body;
        dataStream.on('data', (chunk) => {
            downloadedSize += chunk.length;
            const progress = Math.round((downloadedSize / totalSize) * 100);
            bar.update(progress);
        });

        const fileStream = fs.createWriteStream(`${id}.mp4`);
        dataStream.pipe(fileStream);

        return new Promise((resolve, reject) => {
            dataStream.on('end', () => {
                bar.stop();
                console.log('\n\n File downloaded successfully! Saved as:', `${id}.mp4`);
                resolve({
                    id: id,
                    file: `${id}.mp4`
                });
            });

            dataStream.on('error', (err) => {
                bar.stop();
                console.log('\n\n Error during download:', err);
                reject(err);
            });
        });
    }

    async request(url, body = "", type = "GET") {
        let options = {
            "credentials": "omit",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
                "Accept-Language": "fi-FI,fi;q=0.8,en-US;q=0.5,en;q=0.3",
                "content-type": "application/json",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            },
            "referrer": "https://www.animate-code.com/",
            "method": type,
            "mode": "cors"
        };

        if (type.toUpperCase() === "POST") {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        return response.json();
    }
}

module.exports = animateCode;