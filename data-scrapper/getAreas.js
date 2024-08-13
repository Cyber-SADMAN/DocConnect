import db from './db.js';

const getAreas = async () => {
    const collection = db.collection('areas');
    const areas = await collection
        .find({ districtId: '65f58154fc102bdf67f3d290' })
        .toArray();
    console.log(areas);
};

// export default getAreas;
getAreas();
