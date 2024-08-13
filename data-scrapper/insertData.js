import doctors from './output/dhaka/doctors.json' assert { type: 'json' };
import bcrypt from 'bcrypt';

import db from './db.js';

const doctorCollection = db.collection('doctors');
const chamberCollection = db.collection('chambers');

// get all the doctors
const fetchDoctors = async () => {
    try {
        const result = await doctorCollection.find({}).toArray();

        console.log('Doctors:', result[0]);

        // db.close();
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
};

const insertDoctor = async (doctorJson) => {
    // console.log(doctorJson.email);
    const hashedPassword = await bcrypt.hash('doctorPass', 10);
    // get specialization from doctorJson and make it an array, it is currently a comma separated string
    // make sure to trim the strings
    const specializations = doctorJson.specialization
        .split(',')
        .map((specialization) => specialization.trim());

    const doctor = await doctorCollection.insertOne({
        name: doctorJson.name,
        email: doctorJson.email,
        password: hashedPassword,
        education: doctorJson.education,
        specializations,
        experience: doctorJson.experience,
        active: true,
    });
    // get doctorId from doctor and convert it to string
    const doctorId = doctor.insertedId.toString();

    const visitingHours = {};
    const days = [
        'saturday',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
    ];

    /*
    we want lik
    visitingHours: {
        saturday: {
            start: '10:00 AM',
            end: '12:00 PM',
        },
        sunday: {
            start: '10:00 AM',
            end: '12:00 PM',
        },
        monday: {
            start: '10:00 AM',
            end: '12:00 PM',
        },
        tuesday: {
            start: '10:00 AM',
            end: '12:00 PM',
        },
        wednesday: {
            start: '10:00 AM',
            end: '12:00 PM',
        },
        thursday: {
            start: '10:00 AM',
            end: '12:00 PM',
        },
        friday: {
            start: '10:00 AM',
            end: '12:00 PM',
        },
    },
    */
    for (const day of days) {
        const dayVisitingHour = doctorJson.chambers[0].visitingHour;
        if (dayVisitingHour) {
            visitingHours[day] = {
                start: dayVisitingHour.from,
                end: dayVisitingHour.to,
            };
        }
    }

    // console.log(visitingHours);

    // insert chamber
    const chamber = await chamberCollection.insertOne({
        doctorId,
        name: doctorJson.chambers[0].name,
        address: doctorJson.chambers[0].address,
        areaId: doctorJson.chambers[0].areaId,
        districtId: '65f58154fc102bdf67f3d290',
        visitingHours,
        contact: doctorJson.chambers[0].contact,
        active: true,
    });
};

async function main() {
    // fetchDoctors();

    for (const doctor of doctors) {
        await insertDoctor(doctor);
        // break;
    }
    console.log('Done');
}

main();
