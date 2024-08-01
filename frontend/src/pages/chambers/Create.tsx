import { useEffect, useState } from 'react';
import { statusType } from '../../types';
import { IArea, IDistrict, IChamber, IVisitingHours } from '../../interfaces';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import axios from '../../api/axios';
import Select from 'react-select';
import ComponentLoader from '../../components/ComponentLoader';
import AdminLayout from '../../components/layouts/AdminLayout';
import toast from 'react-hot-toast';
import CustomToast from '../../components/CustomToast';

export interface DistrictOption extends IDistrict {
    id: string;
}
export interface AreaOption extends IArea {
    id: string;
}

const Create = () => {
    const weekDays = [
        'saturday',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
    ];
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    const [districtOptions, setDistrictOption] = useState<DistrictOption[]>([]);
    const [areaOptions, setAreaOption] = useState<AreaOption[]>([]);
    const [initialVisitingHours] = useState<IVisitingHours>({
        saturday: { start: '16:00', end: '22:00', noOfSlots: 0 },
        sunday: { start: '16:00', end: '22:00', noOfSlots: 0 },
        monday: { start: '16:00', end: '22:00', noOfSlots: 0 },
        tuesday: { start: '16:00', end: '22:00', noOfSlots: 0 },
        wednesday: { start: '16:00', end: '22:00', noOfSlots: 0 },
        thursday: { start: '16:00', end: '22:00', noOfSlots: 0 },
        friday: { start: '16:00', end: '22:00', noOfSlots: 0 },
    });

    const [chamber, setChamber] = useState<IChamber>({
        _id: '',
        name: '',
        doctorId: '',
        areaId: '',
        districtId: '',
        address: '',
        visitingHours: initialVisitingHours,
        contact: '',
        active: true,
        createdAt: '',
        updatedAt: '',
    });

    const [selectedDistrict, setSelectedDistrict] =
        useState<DistrictOption | null>(null);
    const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);

    const axiosPrivate = useAxiosPrivate();

    const getDistricts = async () => {
        try {
            const response = await axios.get('/areas/get-districts');
            const districts: DistrictOption[] =
                response.data.data.districts.map((district: any) => ({
                    id: district._id,
                    value: district.name,
                    label: district.name,
                }));
            setDistrictOption(districts);
        } catch (error: any) {
            console.log(error);
            throw error;
        }
    };

    const getAreas = async (districtName: string): Promise<AreaOption[]> => {
        try {
            const response = await axios.get(
                `/areas/get-areas-by-district/${districtName}`
            );
            const areas: AreaOption[] = response.data.data.areas.map(
                (area: any) => ({
                    id: area._id,
                    value: area.name,
                    label: area.name,
                })
            );
            return areas;
        } catch (error: any) {
            console.log(error);
            throw error;
        }
    };

    const handleDistrictChange = async (selectedOption: any) => {
        setSelectedDistrict(selectedOption);
        setChamber({
            ...chamber,
            districtId: selectedOption ? selectedOption.id : '',
            areaId: '',
        });
        setSelectedArea(null);
        if (!selectedOption) {
            setAreaOption([]);
            return;
        }
        const areas: AreaOption[] = await getAreas(selectedOption.label);
        setAreaOption(areas);
    };

    const handleAreaChange = async (selectedOption: any) => {
        setSelectedArea(selectedOption);
        setChamber({ ...chamber, areaId: selectedOption?.id });
    };

    const handleVisitingHoursChange = (
        day: string,
        timeType: string,
        value: string
    ) => {
        setChamber((prevChamber) => ({
            ...prevChamber,
            visitingHours: {
                ...prevChamber.visitingHours,
                [day]: {
                    ...prevChamber.visitingHours[day],
                    [timeType]: value,
                },
            },
        }));
    };

    const handleCheckboxChange = (day: string) => {
        const updatedValue =
            chamber.visitingHours[day].start !== ''
                ? { start: '', end: '', noOfSlots: 0 }
                : initialVisitingHours[day];
        setChamber((prevChamber) => ({
            ...prevChamber,
            visitingHours: {
                ...prevChamber.visitingHours,
                [day]: updatedValue,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);

            await axiosPrivate.post('/chambers', {
                name: chamber.name,
                address: chamber.address,
                districtId: chamber.districtId,
                areaId: chamber.areaId,
                contact: chamber.contact,
                visitingHours: chamber.visitingHours,
                active: chamber.active,
            });
            toast.success('Chamber created successfully');
        } catch (error: any) {
            console.log('Error occurs on submit:', error);

            let errors = error.response.data.message;
            toast.custom((t) => <CustomToast errors={errors} t={t} />);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                await getDistricts();
                setStatus({
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                console.log(error);
                setStatus({
                    loading: false,
                    error: error.response.status || 403,
                });
            }
        })();
    }, []);

    return (
        <ComponentLoader
            status={status}
            component={
                <AdminLayout>
                    <h1 className="text-3xl font-bold mb-6">Add New Chamber</h1>
                    <div className="max-w-3xl">
                        <form onSubmit={handleSubmit}>
                            {/* Basic info */}
                            <div className="p-4 shadow-lg mb-6 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">
                                    Basic Info
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-3">
                                    <div className="">
                                        <label
                                            htmlFor="name"
                                            className="block font-semibold mb-1"
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            placeholder="Enter the name"
                                            className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-2 focus:outline-blue-500"
                                            value={chamber.name}
                                            onChange={(e) =>
                                                setChamber({
                                                    ...chamber,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            htmlFor="address"
                                            className="text-base block font-semibold mb-1"
                                        >
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            placeholder="Enter the address"
                                            className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-2 focus:outline-blue-500"
                                            value={chamber.address}
                                            onChange={(e) =>
                                                setChamber({
                                                    ...chamber,
                                                    address: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="district"
                                            className="block font-semibold mb-1"
                                        >
                                            District
                                        </label>
                                        <Select
                                            id="district"
                                            value={selectedDistrict}
                                            options={districtOptions}
                                            isClearable={true}
                                            placeholder="Select a district"
                                            onChange={handleDistrictChange}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="area"
                                            className="block font-semibold mb-1"
                                        >
                                            Area
                                        </label>
                                        <Select
                                            id="area"
                                            value={selectedArea}
                                            options={areaOptions}
                                            placeholder="Select an area"
                                            onChange={handleAreaChange}
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            htmlFor="contact"
                                            className="block font-semibold mb-1"
                                        >
                                            Contact
                                        </label>
                                        <input
                                            type="text"
                                            id="contact"
                                            placeholder="Enter the contact"
                                            className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-2 focus:outline-blue-500"
                                            value={chamber.contact}
                                            onChange={(e) => {
                                                const { value } = e.target;
                                                // Allow only digits and + at the start
                                                let validValue = value.replace(
                                                    /[^0-9+]/g,
                                                    ''
                                                );

                                                // Ensure the + is only at the start
                                                if (
                                                    validValue.startsWith('+')
                                                ) {
                                                    validValue =
                                                        '+' +
                                                        validValue
                                                            .slice(1)
                                                            .replace(/\+/g, '');
                                                } else {
                                                    validValue =
                                                        validValue.replace(
                                                            /\+/g,
                                                            ''
                                                        );
                                                }

                                                // Limit the length to 15 characters
                                                if (validValue.length > 15) {
                                                    validValue =
                                                        validValue.slice(0, 15);
                                                }

                                                setChamber({
                                                    ...chamber,
                                                    contact: validValue,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* A checkbox input with label for Active */}
                            <div className="mb-6 p-4 shadow-lg rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">
                                    Status
                                </h3>
                                <label
                                    htmlFor="active"
                                    className="flex items-center font-semibold mb-1"
                                >
                                    <input
                                        type="checkbox"
                                        id="active"
                                        name="active"
                                        checked={chamber.active}
                                        onChange={() =>
                                            setChamber({
                                                ...chamber,
                                                active: !chamber.active,
                                            })
                                        }
                                        className="w-4 h-4 mr-2"
                                    />
                                    Active
                                </label>
                            </div>
                            {/* Visiting Hours */}
                            <div className="p-4 shadow-lg mb-6 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3">
                                    Visiting Hours
                                </h3>
                                {weekDays.map((day, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-4 items-center mb-4"
                                    >
                                        <div className="col-span-4 md:col-span-1 mb-2 md:mb-0">
                                            <label
                                                htmlFor={day}
                                                className="flex items-center font-semibold"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={day}
                                                    name={day}
                                                    checked={
                                                        chamber.visitingHours[
                                                            day
                                                        ]['start'] !== '' &&
                                                        chamber.visitingHours[
                                                            day
                                                        ]['end'] !== ''
                                                    }
                                                    onChange={() =>
                                                        handleCheckboxChange(
                                                            day
                                                        )
                                                    }
                                                    className="w-4 h-4 text-blue-600 mr-2"
                                                />
                                                {day.charAt(0).toUpperCase() +
                                                    day.slice(1)}
                                            </label>
                                        </div>
                                        <div className="col-span-4 md:col-span-3 flex">
                                            <input
                                                type="time"
                                                id={`${day}-start`}
                                                name={`${day}-start`}
                                                value={
                                                    chamber.visitingHours[day]
                                                        ?.start || ''
                                                }
                                                onChange={(e) =>
                                                    handleVisitingHoursChange(
                                                        day,
                                                        'start',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    chamber.visitingHours[day]
                                                        .start === '' &&
                                                    chamber.visitingHours[day]
                                                        .end === ''
                                                }
                                                className="border px-3 py-2 rounded-l-md w-full focus:outline-2 focus:outline-blue-500"
                                            />
                                            <input
                                                type="time"
                                                id={`${day}-end`}
                                                name={`${day}-end`}
                                                value={
                                                    chamber.visitingHours[day]
                                                        ?.end || ''
                                                }
                                                onChange={(e) =>
                                                    handleVisitingHoursChange(
                                                        day,
                                                        'end',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    chamber.visitingHours[day]
                                                        .start === '' &&
                                                    chamber.visitingHours[day]
                                                        .end === ''
                                                }
                                                className="border px-3 py-2 rounded-r-md w-full focus:outline-2 focus:outline-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                className={`${
                                    loading
                                        ? 'bg-blue-500 cursor-not-allowed opacity-50'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } text-white px-4 py-2 rounded focus:outline-none`}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Create'}
                            </button>
                        </form>
                    </div>
                </AdminLayout>
            }
        />
    );
};

export default Create;
