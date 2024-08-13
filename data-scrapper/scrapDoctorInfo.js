import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const doctorsInSylhet = [
    'prof-dr-ishtiaque-ul-fattah',
    'prof-dr-kamal-ahmed',
    'dr-m-a-alim',
    'dr-shishir-basak',
    'dr-khair-ahmed-choudhury',
    'dr-nazmus-saqib',
    'prof-dr-syed-mamun-muhammad',
    'dr-md-mushfiqul-hasan',
    'dr-md-rafiqul-islam-dental',
    'dr-md-jahangir-alam-gastroenterology',
    'dr-mahbub-alam-jibon',
];
const doctorsInDhaka = [
    'dr-m-s-alam-utsha',
    'prof-dr-quazi-deen-mohammad',
    'dr-masud-ahmed',
    'dr-sharmin-akter-liza',
    'prof-r-r-kairy',
    'prof-dr-ashok-datta',
    'dr-md-imran-hossain-dentist',
    'prof-dr-shohael-mahmud-arafat',
    'dr-md-shuktarul-islam-tamim',
];
const doctorsInChittagong = ['dr-mohammad-ali', 'dr-mohammad-ali'];

const outputDir = './output/dhaka';

async function fetchHtml(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`ERROR in fetchHtml function : ${error}`);
        throw error;
    }
}

// get doctor info by slug
async function getDoctorInfo(slug) {
    try {
        const url = `https://www.doctorbangladesh.com/${slug}`;
        // console.log(`Fetching data from ${url}`);
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const entryHeader = $('.entry-header');
        const entryContent = $('.entry-content');

        // info is with class = "info" inside the entryHeader
        const info = entryHeader.find('.info');

        // fetch name, inside info with class "entry-title"
        let doctorName = info.find('.entry-title').text();

        // fetch degree, the li wiht title attribute and value = "Degree" inside the info
        let degree = '';
        info.find('li').each((index, element) => {
            if ($(element).attr('title') === 'Degree') {
                degree = $(element).text();
            }
        });

        // fetch speciality, the text with class "speciality"
        let speciality = $('.speciality').text();

        // fetch designation, the li with title "designation". it has a small tag inside which has a strong tag inside
        // find inside the info
        let designation = '';
        info.find('li').each((index, element) => {
            if ($(element).attr('title') === 'Designation') {
                designation = $(element).find('small strong').text();
            }
        });

        // fetch workplace, the li with title "Workplace"
        // find inside info
        let workplace = '';
        info.find('li').each((index, element) => {
            if ($(element).attr('title') === 'Workplace') {
                workplace = $(element).text();
            }
        });

        // inside entryContent
        /*
    <p>
        <strong><a href="#">Queen's Hospital, Sylhet</a></strong><br>
        Address: Subid Bazar, Sylhet - 3100, Bangladesh<br>
        Visiting Hour: 5pm to 10pm (Closed: Friday)<br>
        Appointment: +8801318210276<br>
        <a class="call-now" href="tel:+8801318210276">Call Now</a>
    </p>

    */

        // find first p tag inside entryContent
        const pContent = entryContent.find('p').first();

        // we need Address, Visiting Hour, Appointment
        let address = '';
        let visitingHour = '';
        let appointment = '';

        address = pContent.find('strong').first().text();

        // text after first <br> tag
        let addressText = pContent
            .find('br')[0]
            .next.data.replace('Address: ', '')
            .trim();
        address = address + ', ' + addressText;

        visitingHour = pContent
            .find('br')[1]
            .next.data.replace('Visiting Hour: ', '')
            .trim();

        appointment = pContent
            .find('br')[2]
            .next.data.replace('Appointment: ', '')
            .trim();

        const doctorInfo = {
            doctorName,
            degree,
            speciality,
            designation,
            workplace,
            chamber: address,
            visitingHour,
            appointment,
        };
        // console.log(doctorInfo);
        return doctorInfo;
    } catch (error) {
        console.error(`ERROR in getDoctorInfo function : ${error}`);
        throw error;
    }
}

// main function
async function main() {
    let doctors = [];
    for (const slug of doctorsInDhaka) {
        try {
            const doctorInfo = await getDoctorInfo(slug);
            doctors.push(doctorInfo);
        } catch (error) {
            console.error(
                `ERROR in main function for doctor = ${slug} : ${error}`
            );
        }
    }

    console.log(doctors);

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(outputDir, 'doctors.json'),
        JSON.stringify(doctors, null, 2)
    );
}

export default main;
