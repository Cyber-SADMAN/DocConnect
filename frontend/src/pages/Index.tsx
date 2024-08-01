import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import ComponentLoader from '../components/ComponentLoader';
import { statusType } from '../types';
import RootLayout from '../../src/components/layouts/RootLayout';
import Select from 'react-select';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    ISpecialization,
    IDoctor,
    IIndexFilters,
    IDistrictOption,
    IAreaOption,
} from '../interfaces';

const DoctorCard = ({ doctor }: { doctor: IDoctor }) => {
    return (
        <Link
            to={`/doctors/${doctor._id}`}
            className="bg-white rounded-md shadow-md p-4"
            key={doctor._id}
        >
            <h1 className="text-xl font-bold">{doctor.name}</h1>
            <p className="text-gray-600 mb-2">{doctor.education}</p>
            <div className="flex flex-wrap gap-2">
                {doctor.specializations && doctor.specializations.length > 0 ? (
                    doctor.specializations.map((spec, index) => (
                        <div
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded-md text-gray-700"
                        >
                            {spec}
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500">No specializations</div>
                )}
            </div>
        </Link>
    );
};

const Index = () => {
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [districtOptions, setDistrictOptions] = useState<IDistrictOption[]>(
        []
    );
    const [areaOptions, setAreaOptions] = useState<IAreaOption[]>([]);
    const [specializationOptions, setSpecializationOptions] = useState<
        ISpecialization[]
    >([]);

    const [doctors, setDoctors] = useState<IDoctor[]>([]);

    const [filters, setFilters] = useState<IIndexFilters>({
        name: searchParams.get('name') || '',
        district: searchParams.get('district') || '',
        areas: searchParams.getAll('areas[]') || [],
        specializations: searchParams.getAll('specializations[]') || [],
        page: 1,
        limit: 10,
        available: true,
        sortBy: 'name',
    });

    const getDoctors = async () => {
        try {
            const response = await axios.get('/users/doctors', {
                params: filters,
            });
            const doctors: IDoctor[] = response.data.data.doctors;
            setDoctors(doctors);
        } catch (error: any) {
            console.log(error);
        }
    };

    const getSpecializations = async () => {
        try {
            const response = await axios.get(
                '/users/doctors/get-specializations'
            );
            const specializations: string[] =
                response.data.data.specializations;
            setSpecializationOptions(
                specializations.map((spec) => ({
                    id: spec,
                    value: spec,
                    label: spec,
                }))
            );
        } catch (error: any) {
            console.log(error);
        }
    };

    const getDistricts = async () => {
        try {
            const response = await axios.get('/areas/get-districts');
            const districts: IDistrictOption[] =
                response.data.data.districts.map((district: any) => ({
                    id: district._id,
                    value: district.name,
                    label: district.name,
                }));
            setDistrictOptions(districts);
        } catch (error: any) {
            console.log(error);
        }
    };

    const getAreas = async (districtName: string): Promise<IAreaOption[]> => {
        try {
            const response = await axios.get(
                `/areas/get-areas-by-district/${districtName}`
            );
            const areas: IAreaOption[] = response.data.data.areas.map(
                (area: any) => ({
                    id: area._id,
                    value: area.name,
                    label: area.name,
                })
            );
            return areas;
        } catch (error: any) {
            console.log(error);
            return [];
        }
    };

    const handleDistrictChange = async (selectedOption: any) => {
        setFilters({
            ...filters,
            district: selectedOption ? selectedOption.value : '',
        });
    };

    const handleAreaChange = (selectedOptions: any) => {
        const areaNames: string[] = selectedOptions.map(
            (option: any) => option.value
        );
        setFilters({ ...filters, areas: areaNames });
    };

    const handleSpecializationChange = (selectedOptions: any) => {
        const specializations: string[] = selectedOptions.map(
            (option: any) => option.value
        );
        setFilters({ ...filters, specializations: specializations });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const searchParams = new URLSearchParams();
        searchParams.set('name', filters.name);
        searchParams.set('district', filters.district);
        filters.areas.forEach((area) => searchParams.append('areas[]', area));
        filters.specializations.forEach((spec) =>
            searchParams.append('specializations[]', spec)
        );
        searchParams.set('page', filters.page.toString());
        searchParams.set('limit', filters.limit.toString());

        setSearchParams(searchParams);
        await getDoctors();
    };

    useEffect(() => {
        (async () => {
            try {
                const initialFilters: IIndexFilters = {
                    name: searchParams.get('name') || '',
                    district: searchParams.get('district') || '',
                    areas: searchParams.getAll('areas[]') || [],
                    specializations:
                        searchParams.getAll('specializations[]') || [],
                    page:
                        searchParams.get('page') &&
                        Number(searchParams.get('page')) > 0
                            ? Number(searchParams.get('page'))
                            : 1,
                    limit:
                        searchParams.get('limit') &&
                        Number(searchParams.get('limit')) > 0
                            ? Number(searchParams.get('limit'))
                            : 10,
                    available: true,
                    sortBy: 'name',
                };

                setFilters(initialFilters);

                await getDistricts();
                await getSpecializations();
                await getDoctors();
                setStatus({
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                toast.error(error.response.data.message);
                setStatus({
                    loading: false,
                    error: error.response.data.message,
                });
            }
        })();
    }, [searchParams]);

    useEffect(() => {
        (async () => {
            if (!filters.district) {
                setAreaOptions([]);
                return;
            }
            const areas: IAreaOption[] = await getAreas(filters.district);
            setAreaOptions(areas);
        })();
    }, [filters.district]);

    return (
        <ComponentLoader
            status={status}
            component={
                <RootLayout>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Search by name"
                            className="w-full mb-4 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                            value={filters.name}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    name: e.target.value,
                                })
                            }
                        />
                        <Select
                            className="w-full mb-4"
                            options={districtOptions}
                            isClearable={true}
                            placeholder="Select a city"
                            onChange={handleDistrictChange}
                            value={districtOptions.find(
                                (districtOption: IDistrictOption) =>
                                    districtOption.value === filters.district
                            )}
                        />
                        <Select
                            className="w-full mb-4"
                            options={areaOptions}
                            isMulti
                            placeholder="Select areas"
                            onChange={handleAreaChange}
                            value={areaOptions.filter(
                                (areaOption: IAreaOption) =>
                                    filters.areas.includes(areaOption.value)
                            )}
                        />
                        <Select
                            className="w-full mb-4"
                            options={specializationOptions}
                            isMulti
                            placeholder="Select specializations"
                            onChange={handleSpecializationChange}
                            value={specializationOptions.filter(
                                (specOption: ISpecialization) =>
                                    filters.specializations.includes(
                                        specOption.value
                                    )
                            )}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Search
                        </button>
                    </form>

                    <div className="mt-5">
                        {doctors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {doctors.map((doctor: IDoctor) => (
                                    <DoctorCard
                                        key={doctor._id}
                                        doctor={doctor}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center mt-8 lg:mt-24">
                                <h1>No doctor found</h1>
                            </div>
                        )}
                    </div>
                </RootLayout>
            }
        />
    );
};

export default Index;
