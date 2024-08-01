const inputDir = './input';

async function fromatAreas() {
    // Read the file
    const filePath = path.join(inputDir, 'sylAreas.json');
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });

    // Parse the file content
    const parsedContent = JSON.parse(fileContent);
    console.log(parsedContent);

    const areaObj = [];
    for (const area of parsedContent) {
        areaObj.push({ districtId: '65f58154fc102bdf67f3d285', name: area });
    }

    console.log(areaObj);
}

export default formatAreas;
