import doctorInfoScrapper from './scrapDoctorInfo.js';
// import insertData from './insertData.js';

const main = async () => {
    await doctorInfoScrapper();
    // await insertData();
};

main();
