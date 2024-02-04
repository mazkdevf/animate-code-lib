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