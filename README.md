# Animate Code Exporter LIB

This lib is like a handy helper for [animate-code.com](https://www.animate-code.com), created by [Josh](https://github.com/joschan21). It makes exporting code to a video super easy, just like how you do it on the website.

You can also check out how it works by watching this [YouTube video](https://youtu.be/OXk6Eabu7uM?si=AxkItQ6-oyZR1i1b).

## Usage

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

By running this script, a file with the name `{randomizedId}.mp4` will be generated in the same directory as the script itself.
