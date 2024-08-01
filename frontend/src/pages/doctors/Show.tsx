import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Doctor } from '../../interfaces';
import axios from '../../api/axios';
import ComponentLoader from '../../components/ComponentLoader';
import RootLayout from '../../components/layouts/RootLayout';
import { statusType } from '../../types';
import { format, addDays, getDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export interface IAppointment {
    doctorId: string;
    chamberId: string;
    patientName: string;
    patientEmail: string;
    date: string;
    weekday: string;
}

const DoctorComponent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [selectedChamberId, setSelectedChamberId] = useState<string>('');
    const [selectedChamberHours, setSelectedChamberHours] = useState<any>(null);
    const [appointmentDetails, setAppointmentDetails] = useState<IAppointment>({
        doctorId: '',
        chamberId: '',
        patientName: '',
        patientEmail: '',
        date: '',
        weekday: '',
    });
    const [bookedAppointmentsCount, setBookedAppointmentsCount] = useState<
        Record<string, any>
    >({});

    const weekDays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    const fetchDoctor = async () => {
        try {
            if (!id) {
                setStatus({
                    loading: false,
                    error: 404,
                });
                return;
            }

            setAppointmentDetails({
                ...appointmentDetails,
                doctorId: id,
            });

            const response = await axios.get(`/users/doctors/${id}`);
            console.log('resp:', response);
            const data = response.data.data.doctor;
            if (!data) {
                setStatus({
                    loading: false,
                    error: 404,
                });
            } else {
                setDoctor(data);
                setBookedAppointmentsCount(
                    response.data.data.bookedAppointmentsCount
                );
                setStatus({
                    loading: false,
                    error: null,
                });
            }
        } catch (error: any) {
            const errorStatusCode: any = error.response.status;
            setStatus({
                loading: false,
                error: errorStatusCode ? errorStatusCode : 500,
            });
        }
    };

    useEffect(() => {
        (async () => {
            await fetchDoctor();
        })();
    }, [id]);

    const formatTime = (time: string): string => {
        const [hour, minute] = time.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    const handleChamberChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const chamberId = e.target.value;

        setSelectedChamberId(chamberId);
        setAppointmentDetails({
            ...appointmentDetails,
            chamberId: chamberId,
        });
        const selectedChamber = doctor?.chambers.find(
            (chamber) => chamber._id === chamberId
        );
        if (selectedChamber) {
            setSelectedChamberHours(selectedChamber.visitingHours);
        }

        setAppointmentDetails({
            ...appointmentDetails,
            chamberId: chamberId,
        });
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAppointmentDetails({
            ...appointmentDetails,
            [name]: value,
        });
    };

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const selectedDay = next7Days.find((day) => day.date === value);
        setAppointmentDetails({
            ...appointmentDetails,
            date: value,
            weekday: selectedDay ? selectedDay.weekday : '',
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                '/appointments',
                appointmentDetails
            );
            const appointmentData = response.data.data.appointment;
            localStorage.setItem('appointmentId', appointmentData._id);
            navigate('/appointment-verification');
        } catch (error: any) {
            console.error('Error booking appointment:', error);
            toast.error(error.response.data.message);
        }
    };

    const today = new Date();
    const next7Days: { date: string; weekday: string }[] = [];
    next7Days.push({
        date: format(today, 'yyyy-MM-dd'),
        weekday: weekDays[getDay(today)],
    });

    for (let i = 1; i < 7; i++) {
        const nextDay = addDays(today, i);
        next7Days.push({
            date: format(nextDay, 'yyyy-MM-dd'),
            weekday: weekDays[getDay(nextDay)],
        });
    }

    return (
        <ComponentLoader
            status={status}
            component={
                <RootLayout>
                    <div className="bg-white shadow-md rounded-lg p-3 md:p-6">
                        <h2 className="text-3xl font-semibold mb-4">
                            {doctor?.name}
                        </h2>
                        <p className="mb-6 text-gray-600">
                            {doctor?.education}
                        </p>
                        <p className="mb-4">
                            <strong>Specialized in:</strong>{' '}
                            {doctor?.specializations.join(', ')}
                        </p>
                        <div className="">
                            <h3 className="font-semibold text-xl">
                                Experience
                            </h3>
                            <p>{doctor?.experience.title}</p>
                            <p>{doctor?.experience.institute}</p>
                            <p>{doctor?.experience.address}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-3 md:p-6 mt-4">
                        <h3 className="font-semibold text-2xl mb-4 border-b pb-1 border-b-gray-300">
                            Book Appointment
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="mb-4">
                                <label
                                    htmlFor="chamber"
                                    className="block font-semibold mb-2"
                                >
                                    Select Chamber
                                </label>
                                <select
                                    id="chamber"
                                    value={selectedChamberId}
                                    onChange={handleChamberChange}
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">
                                        -- Select Chamber --
                                    </option>
                                    {doctor?.chambers.map((chamber) => (
                                        <option
                                            key={chamber._id}
                                            value={chamber._id}
                                        >
                                            {chamber.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedChamberId && (
                                <div className="mb-4">
                                    <label
                                        htmlFor="date"
                                        className="block font-semibold mb-2"
                                    >
                                        Select Date
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {next7Days.map((day, index) => {
                                            const booking =
                                                bookedAppointmentsCount[
                                                    selectedChamberId
                                                ]?.find(
                                                    (booking: any) =>
                                                        booking.date ===
                                                        day.date
                                                );
                                            const bookedCount = booking
                                                ? booking.count
                                                : 0;
                                            const isToday =
                                                format(today, 'yyyy-MM-dd') ===
                                                day.date;

                                            return (
                                                selectedChamberHours &&
                                                selectedChamberHours[
                                                    day.weekday
                                                ].start &&
                                                selectedChamberHours[
                                                    day.weekday
                                                ].end && (
                                                    <label
                                                        key={index}
                                                        className="block p-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                                                    >
                                                        <div className="flex items-start">
                                                            <input
                                                                type="radio"
                                                                name="date"
                                                                value={day.date}
                                                                checked={
                                                                    appointmentDetails.date ===
                                                                    day.date
                                                                }
                                                                onChange={
                                                                    handleDateChange
                                                                }
                                                                className="mt-[3px] mr-2 w-5 h-5"
                                                                required
                                                            />
                                                            <div>
                                                                <span className="font-bold capitalize">
                                                                    {
                                                                        day.weekday
                                                                    }
                                                                </span>
                                                                {isToday && (
                                                                    <span className="text-sm text-blue-500 ml-2">
                                                                        (Today)
                                                                    </span>
                                                                )}
                                                                <div className="text-gray-600">
                                                                    {format(
                                                                        new Date(
                                                                            day.date
                                                                        ),
                                                                        'MMMM d, yyyy'
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    From{' '}
                                                                    {formatTime(
                                                                        selectedChamberHours[
                                                                            day
                                                                                .weekday
                                                                        ].start
                                                                    )}{' '}
                                                                    To{' '}
                                                                    {formatTime(
                                                                        selectedChamberHours[
                                                                            day
                                                                                .weekday
                                                                        ].end
                                                                    )}
                                                                </div>
                                                                <div className="text-gray-600">
                                                                    Booked
                                                                    Count:{' '}
                                                                    {
                                                                        bookedCount
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label
                                    htmlFor="patientName"
                                    className="block font-semibold mb-2"
                                >
                                    Patient Name
                                </label>
                                <input
                                    type="text"
                                    id="patientName"
                                    name="patientName"
                                    value={appointmentDetails.patientName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter patient name"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="email"
                                    className="block font-semibold mb-2"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="patientEmail"
                                    value={appointmentDetails.patientEmail}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter email"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Make Appointment
                            </button>
                        </form>
                    </div>
                </RootLayout>
            }
        />
    );
};

export default DoctorComponent;
