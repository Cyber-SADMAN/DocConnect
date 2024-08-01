import doctors from './output/sylhet/doctors.json' assert { type: 'json' };

import db from './db.js';

// get all the doctors
const fetchDoctors = async () => {
    try {
        const collection = db.collection('doctors');
        const result = await collection.find({}).toArray();

        console.log('Doctors:', result[0]);

        // db.close();
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
};

async function main() {
    fetchDoctors();
}

main();
