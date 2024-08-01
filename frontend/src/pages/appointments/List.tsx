import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { IAppointment, IChamber } from '../../interfaces';
import ComponentLoader from '../../components/ComponentLoader';
import { statusType } from '../../types';
import AdminLayout from '../../components/layouts/AdminLayout';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import useAuth from '../../hooks/useAuth';

export interface IAppointmentFilter {
    chamberId: string;
    startDate: string;
    endDate: string;
    isToday: boolean;
    patientName: string;
    patientEmail: string;
    status: string;
}

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'requested', label: 'Requested' },
    { value: 'verified', label: 'Verified' },
    { value: 'queued', label: 'Queued' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
];

const Appointments = () => {
    const userRole = 2;
    const [appointments, setAppointments] = useState<IAppointment[]>([]);
    const [chambers, setChambers] = useState<
        { value: string; label: string }[]
    >([]);
    const [myChamber, setMyChamber] = useState<string>('');
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    const getTodayDate = () => {
        const todayDate = new Date();
        const dhakaTimezone = 'Asia/Dhaka';

        // Convert today's date to Asia/Dhaka timezone
        const todayDateDhakaTimezone = toZonedTime(todayDate, dhakaTimezone);

        // Format the date as YYYY-MM-DD
        const formattedDate = format(todayDateDhakaTimezone, 'yyyy-MM-dd');

        return formattedDate;
    };

    const [filters, setFilters] = useState<IAppointmentFilter>({
        chamberId: searchParams.get('chamberId') || '',
        startDate: searchParams.get('startDate') || '',
        endDate: searchParams.get('endDate') || '',
        isToday: false,
        patientName: searchParams.get('patientName') || '',
        patientEmail: searchParams.get('patientEmail') || '',
        status: searchParams.get('status') || '',
    });
    const [statusUpdating, setStatusUpdating] = useState(false);

    const isTodayDate = () => {
        const todayDate = getTodayDate();
        return (
            searchParams.get('startDate') === todayDate &&
            searchParams.get('endDate') === todayDate
        );
    };

    const fetchAppointments = async () => {
        try {
            const queryParams = new URLSearchParams();
            const todayDate = getTodayDate();

            if (filters.isToday) {
                queryParams.set('startDate', todayDate);
                queryParams.set('endDate', todayDate);
            } else {
                if (filters.startDate)
                    queryParams.set('startDate', filters.startDate);
                if (filters.endDate)
                    queryParams.set('endDate', filters.endDate);
            }
            if (filters.chamberId)
                queryParams.set('chamberId', filters.chamberId);
            if (filters.patientName)
                queryParams.set('patientName', filters.patientName);
            if (filters.patientEmail)
                queryParams.set('patientEmail', filters.patientEmail);
            if (filters.status) queryParams.set('status', filters.status);

            const response = await axiosPrivate.get(
                `/appointments?${queryParams}`
            );
            setAppointments(response.data.data.appointments);
        } catch (error: any) {
            throw error;
        }
    };

    const fetchChambers = async () => {
        try {
            const response = await axiosPrivate.get('/chambers');
            const chambers = response.data.data.chambers.map(
                (chamber: IChamber) => ({
                    value: chamber._id,
                    label: chamber.name,
                })
            );
            chambers.unshift({ value: '', label: 'All' });
            setChambers(chambers);
        } catch (error: any) {
            throw error;
        }
    };

    const fetchMyChamber = async () => {
        try {
            const response = await axiosPrivate.get('/chambers/my-chamber');
            setMyChamber(response.data.data.chamber.name);
        } catch (error: any) {
            throw error;
        }
    };

    const handleFilterChange = (name: string, value: any) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleIsTodayChange = () => {
        const todayDate = getTodayDate();
        const check = !filters.isToday;
        setFilters((prevFilters) => ({
            ...prevFilters,
            isToday: check,
            startDate: check
                ? todayDate
                : (searchParams.get('startDate') as string) == todayDate
                ? ''
                : (searchParams.get('startDate') as string),
            endDate: check
                ? todayDate
                : (searchParams.get('endDate') as string) == todayDate
                ? ''
                : (searchParams.get('endDate') as string),
        }));
    };

    const handleStatusUpdate = async (
        appointmentId: string,
        cancel: boolean
    ) => {
        setStatusUpdating(true);
        try {
            const response = await axiosPrivate.put(
                `/appointments/update-status/${appointmentId}`,
                { cancel: cancel ? 1 : 0 }
            );
            // Update the appointment status in the state if needed
            console.log(response.data.data.appointment);

            // Refresh the appointments list or update the state accordingly
            await fetchAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleSearch = () => {
        const queryParams = new URLSearchParams();

        const todayDate = getTodayDate();

        if (filters.chamberId) queryParams.set('chamberId', filters.chamberId);
        if (filters.isToday) {
            queryParams.set('startDate', todayDate);
            queryParams.set('endDate', todayDate);
        } else {
            if (filters.startDate)
                queryParams.set('startDate', filters.startDate);
            if (filters.endDate) queryParams.set('endDate', filters.endDate);
        }
        if (filters.patientName)
            queryParams.set('patientName', filters.patientName);
        if (filters.patientEmail)
            queryParams.set('patientEmail', filters.patientEmail);
        if (filters.status) queryParams.set('status', filters.status);

        navigate({ search: queryParams.toString() });
    };

    useEffect(() => {
        (async () => {
            try {
                if (auth.role == 2) {
                    await fetchChambers();
                } else {
                    await fetchMyChamber();
                }

                const initialFilters = {
                    chamberId: searchParams.get('chamberId') || '',
                    startDate: searchParams.get('startDate') || '',
                    endDate: searchParams.get('endDate') || '',
                    isToday:
                        searchParams.get('startDate') === getTodayDate() &&
                        searchParams.get('endDate') === getTodayDate(),
                    patientName: searchParams.get('patientName') || '',
                    patientEmail: searchParams.get('patientEmail') || '',
                    status: searchParams.get('status') || '',
                };
                setFilters(initialFilters);

                await fetchAppointments();
                setStatus({
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                console.log('Error occurs:', error.response.data.message);
                setStatus({
                    loading: false,
                    error: error.response.status || 500,
                });
            }
        })();
    }, [searchParams]);

    useEffect(() => {
        const todayDate = getTodayDate();
        if (filters.startDate === todayDate && filters.endDate === todayDate) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                today: true,
            }));
        }
    }, [filters.startDate, filters.endDate]);

    return (
        <ComponentLoader
            status={status}
            component={
                <AdminLayout>
                    <div>
                        <h2 className="text-2xl font-bold border-b-2 border-b-gray-400 pb-2 mb-4">
                            Appointments
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <form className="col-span-4 md:col-span-1 flex flex-col gap-4 max-w-4xl mb-4">
                                {auth.role == 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                        <div className="">
                                            <label
                                                htmlFor="chamber"
                                                className="block mb-1 font-semibold"
                                            >
                                                Chamber
                                            </label>
                                            <Select
                                                name="chamberId"
                                                value={chambers.find(
                                                    (chamber) =>
                                                        chamber.value ===
                                                        filters.chamberId
                                                )}
                                                onChange={(option) =>
                                                    handleFilterChange(
                                                        'chamberId',
                                                        option
                                                            ? option.value
                                                            : ''
                                                    )
                                                }
                                                options={chambers}
                                                isClearable
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="">
                                            <label
                                                htmlFor="status"
                                                className="block mb-1 font-semibold"
                                            >
                                                Status
                                            </label>
                                            <Select
                                                name="status"
                                                value={statusOptions.find(
                                                    (status) =>
                                                        status.value ===
                                                        filters.status
                                                )}
                                                onChange={(option) =>
                                                    handleFilterChange(
                                                        'status',
                                                        option
                                                            ? option.value
                                                            : ''
                                                    )
                                                }
                                                options={statusOptions}
                                                isClearable
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* a checkbox for today */}
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="today"
                                            name="today"
                                            checked={filters.isToday}
                                            onChange={handleIsTodayChange}
                                            className="w-4 h-4 text-blue-600  bg-gray-100 border-gray-300 rounded focus:ring-blue-500 0 focus:ring-2 mr-2"
                                        />
                                        <label
                                            htmlFor="today"
                                            className="font-semibold"
                                        >
                                            Today
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div className="">
                                        <label
                                            htmlFor="startDate"
                                            className="block mb-1 font-semibold"
                                        >
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    'startDate',
                                                    e.target.value
                                                )
                                            }
                                            className="border border-gray-300 rounded px-3 py-1.5 w-full"
                                            disabled={filters.isToday}
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            htmlFor="endDate"
                                            className="block mb-1 font-semibold"
                                        >
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    'endDate',
                                                    e.target.value
                                                )
                                            }
                                            className="border border-gray-300 rounded px-3 py-1.5 w-full"
                                            disabled={filters.isToday}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div className="">
                                        <label
                                            htmlFor="patientName"
                                            className="block mb-1 font-semibold"
                                        >
                                            Patient Name
                                        </label>
                                        <input
                                            type="text"
                                            name="patientName"
                                            value={filters.patientName}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    'patientName',
                                                    e.target.value
                                                )
                                            }
                                            className="border border-gray-300 rounded px-3 py-1.5 w-full"
                                            placeholder="Enter patient name"
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            htmlFor="patientEmail"
                                            className="block mb-1 font-semibold"
                                        >
                                            Patient Email
                                        </label>
                                        <input
                                            type="text"
                                            name="patientEmail"
                                            value={filters.patientEmail}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    'patientEmail',
                                                    e.target.value
                                                )
                                            }
                                            className="border border-gray-300 rounded px-3 py-1.5 w-full"
                                            placeholder="Enter patient email address"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleSearch}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Search
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilters({
                                                chamberId: '',
                                                startDate: getTodayDate(),
                                                endDate: getTodayDate(),
                                                isToday: true,
                                                patientName: '',
                                                patientEmail: '',
                                                status: '',
                                            })
                                        }
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>

                            <div className="col-span-4 md:col-span-3 gap-4">
                                {appointments.length > 0 ? (
                                    <>
                                        {auth.role == 2 &&
                                            searchParams.get('chamberId') && (
                                                <h3 className="text-xl text-gray-500">
                                                    {
                                                        chambers.find(
                                                            (chamber) =>
                                                                chamber.value ===
                                                                searchParams.get(
                                                                    'chamberId'
                                                                )
                                                        )?.label
                                                    }
                                                </h3>
                                            )}
                                        {auth.role == 3 && (
                                            <h3 className="text-xl text-gray-500">
                                                {myChamber}
                                            </h3>
                                        )}
                                        <table className="min-w-full bg-white border border-gray-200 mt-4">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    {isTodayDate() ? (
                                                        <th className="text-left py-2 px-4 border-b">
                                                            Serial No
                                                        </th>
                                                    ) : (
                                                        <th className="text-left py-2 px-4 border-b">
                                                            Date
                                                        </th>
                                                    )}
                                                    <th className="text-left py-2 px-4 border-b">
                                                        Name
                                                    </th>
                                                    <th className="text-left py-2 px-4 border-b">
                                                        Email
                                                    </th>
                                                    <th className="text-left py-2 px-4 border-b">
                                                        Status
                                                    </th>
                                                    {isTodayDate() && (
                                                        <th className="text-left py-2 px-4 border-b">
                                                            Actions
                                                        </th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.map(
                                                    (appointment) => (
                                                        <tr
                                                            key={
                                                                appointment._id
                                                            }
                                                            className="hover:bg-gray-50"
                                                        >
                                                            {isTodayDate() ? (
                                                                <td className="py-2 px-4 border-b font-semibold">
                                                                    #
                                                                    {
                                                                        appointment.serialNo
                                                                    }
                                                                </td>
                                                            ) : (
                                                                <td className="py-2 px-4 border-b">
                                                                    {new Date(
                                                                        appointment.date
                                                                    ).toLocaleString(
                                                                        'en-US',
                                                                        {
                                                                            timeZone:
                                                                                'Asia/Dhaka',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                        }
                                                                    )}
                                                                </td>
                                                            )}
                                                            <td className="py-2 px-4 border-b">
                                                                {
                                                                    appointment.patientName
                                                                }
                                                            </td>
                                                            <td className="py-2 px-4 border-b">
                                                                {
                                                                    appointment.patientEmail
                                                                }
                                                            </td>
                                                            <td className="py-2 px-4 border-b">
                                                                {
                                                                    appointment.status
                                                                }
                                                            </td>
                                                            {isTodayDate() && (
                                                                <td className="py-2 px-4 border-b">
                                                                    {[
                                                                        'requested',
                                                                        'verified',
                                                                        'queued',
                                                                        'ongoing',
                                                                    ].includes(
                                                                        appointment.status
                                                                    ) && (
                                                                        <>
                                                                            {appointment.status ===
                                                                                'requested' && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleStatusUpdate(
                                                                                                appointment._id,
                                                                                                false
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            statusUpdating
                                                                                        }
                                                                                        className="bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
                                                                                    >
                                                                                        Verify
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleStatusUpdate(
                                                                                                appointment._id,
                                                                                                true
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            statusUpdating
                                                                                        }
                                                                                        className="bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 ml-2"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            {appointment.status ===
                                                                                'verified' && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleStatusUpdate(
                                                                                                appointment._id,
                                                                                                false
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            statusUpdating
                                                                                        }
                                                                                        className="bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
                                                                                    >
                                                                                        Queue
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleStatusUpdate(
                                                                                                appointment._id,
                                                                                                true
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            statusUpdating
                                                                                        }
                                                                                        className="bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 ml-2"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            {appointment.status ===
                                                                                'queued' && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleStatusUpdate(
                                                                                                appointment._id,
                                                                                                false
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            statusUpdating
                                                                                        }
                                                                                        className="bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
                                                                                    >
                                                                                        Start
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleStatusUpdate(
                                                                                                appointment._id,
                                                                                                true
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            statusUpdating
                                                                                        }
                                                                                        className="bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 ml-2"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            {appointment.status ===
                                                                                'ongoing' &&
                                                                                userRole ===
                                                                                    2 && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleStatusUpdate(
                                                                                                    appointment._id,
                                                                                                    false
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                statusUpdating
                                                                                            }
                                                                                            className="bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
                                                                                        >
                                                                                            Complete
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleStatusUpdate(
                                                                                                    appointment._id,
                                                                                                    true
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                statusUpdating
                                                                                            }
                                                                                            className="bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 ml-2"
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                        </>
                                                                    )}
                                                                    {[
                                                                        'completed',
                                                                        'cancelled',
                                                                    ].includes(
                                                                        appointment.status
                                                                    ) && (
                                                                        <p className="text-gray-500">
                                                                            Nothing
                                                                            to
                                                                            perform
                                                                        </p>
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </>
                                ) : (
                                    <p>No appointments available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </AdminLayout>
            }
        />
    );
};

export default Appointments;
