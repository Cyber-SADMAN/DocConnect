import { z } from 'zod';

const timeSchema = z
    .string()
    .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Invalid time format. Expected format is HH:mm'
    );

const visitingHoursSchema = z.object({
    saturday: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
    sunday: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
    monday: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
    tuesday: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
    wednesday: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
    thursday: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
    friday: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
});

const chamberSchema = z.object({
    _id: z.string(),
    doctorId: z.string(),
    name: z.string(),
    address: z.string(),
    areaId: z.string(),
    districtId: z.string(),
    visitingHours: visitingHoursSchema,
    contact: z
        .string()
        .regex(
            /^\+?\d{10,15}$/,
            'Invalid contact number format. Expected format is +[country code][number]'
        ),
    active: z.boolean(),
});

// Example usage to validate an input object
const exampleChamber = {
    _id: '65f6d13ac11a15642b0f94ae',
    doctorId: '65f6d13ac11a15642b0f94ad',
    name: 'Oasis Hospital',
    address: 'Subhanighat, Sylhet',
    areaId: '65f58837fc102bdf67f3d2fc',
    districtId: '65f58154fc102bdf67f3d285',
    visitingHours: {
        saturday: { start: '17:00', end: '21:00' },
        sunday: { start: '17:00', end: '21:00' },
        monday: { start: '17:00', end: '21:00' },
        tuesday: { start: '17:00', end: '21:00' },
        wednesday: { start: '17:00', end: '21:00' },
        thursday: { start: '17:00', end: '21:00' },
        friday: { start: '17:00', end: '21:00' },
        _id: '665029e5a1f77b76323eb206',
    },
    contact: '+8801701266679',
    active: true,
};

const validation = chamberSchema.safeParse(exampleChamber);

if (validation.success) {
    console.log('Validation succeeded:', validation.data);
} else {
    console.log('Validation failed:', validation.error.errors);
}
