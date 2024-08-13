import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layouts/AdminLayout';
import ComponentLoader from '../../components/ComponentLoader';
import { IUser, IExperience, ISpecialization } from '../../interfaces';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import axios from '../../api/axios';

const Profile = () => {
    const [user, setUser] = useState<IUser | null>(null);
    const [status, setStatus] = useState({ loading: true, error: null });
    const [loading, setLoading] = useState(false);

    const [specializationOptions, setSpecializationOptions] = useState<
        ISpecialization[]
    >([]);

    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        (async () => {
            await fetchProfile();
            await getSpecializations();
        })();
    }, []);

    useEffect(() => {
        if (user && user.role == 2 && user.specializations) {
            setSpecializationOptions(
                user?.specializations.map((spec: string) => ({
                    id: spec,
                    value: spec,
                    label: spec,
                }))
            );
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await axiosPrivate.get('/auth/profile');
            setUser(response.data.data.user);
            setStatus({ loading: false, error: null });
        } catch (error: any) {
            console.log('Error fetching profile:', error.response.data.message);
            setStatus({ loading: false, error: error.response.status || 500 });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (user) {
            setUser({ ...user, [name]: value });
        }
    };

    const handleExperienceChange = (
        field: keyof IExperience,
        value: string
    ) => {
        if (user && user.experience) {
            setUser({
                ...user,
                experience: {
                    ...user.experience,
                    [field]: value,
                },
            });
        }
    };

    const handleSpecializationsChange = (selectedOptions: any) => {
        const specializations: string[] = selectedOptions.map(
            (option: any) => option.value
        );
        if (user) {
            setUser({ ...user, specializations: specializations });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log(user);
        // return;
        try {
            setLoading(true);
            await axiosPrivate.put('/profile', user);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.log('Error updating profile:', error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ComponentLoader
            status={status}
            component={
                <AdminLayout>
                    <h2 className="text-2xl font-bold border-b-2 border-b-gray-400 pb-2 mb-4">
                        Update Profile
                    </h2>
                    <div className="max-w-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label
                                    className="font-semibold block mb-1"
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter your name"
                                    className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                    value={user?.name || ''}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-2">
                                <label
                                    className="font-semibold block mb-1"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 bg-gray-100 focus:outline-none"
                                    value={user?.email || ''}
                                    readOnly
                                />
                            </div>
                            {user?.role === 2 && (
                                <>
                                    <div className="mb-2">
                                        <label
                                            className="font-semibold block mb-1"
                                            htmlFor="education"
                                        >
                                            Education
                                        </label>
                                        <input
                                            type="text"
                                            id="education"
                                            name="education"
                                            placeholder="Enter your education"
                                            className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                            value={user?.education || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label
                                            className="font-semibold block mb-1"
                                            htmlFor="experience"
                                        >
                                            Experience
                                        </label>

                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                name="title"
                                                placeholder="Title"
                                                className="w-full mb-1 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                                value={user?.experience?.title}
                                                onChange={(e) =>
                                                    handleExperienceChange(
                                                        'title',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="text"
                                                name="institute"
                                                placeholder="Institute"
                                                className="w-full mb-1 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    user?.experience?.institute
                                                }
                                                onChange={(e) =>
                                                    handleExperienceChange(
                                                        'institute',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="text"
                                                name="institute"
                                                placeholder="Institute"
                                                className="w-full mb-1 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    user?.experience?.address
                                                }
                                                onChange={(e) =>
                                                    handleExperienceChange(
                                                        'address',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <label
                                            className="font-semibold block mb-1"
                                            htmlFor="experience"
                                        >
                                            Specializations
                                        </label>
                                        <Select
                                            className="w-full mb-4"
                                            options={specializationOptions}
                                            value={specializationOptions.filter(
                                                (specOption: ISpecialization) =>
                                                    user.specializations &&
                                                    user.specializations.includes(
                                                        specOption.value
                                                    )
                                            )}
                                            isMulti
                                            placeholder="Select specializations"
                                            onChange={
                                                handleSpecializationsChange
                                            }
                                        />
                                    </div>
                                </>
                            )}
                            {user?.role === 3 && (
                                <div className="mb-2">
                                    <label
                                        className="font-semibold block mb-1"
                                        htmlFor="contact"
                                    >
                                        Contact
                                    </label>
                                    <input
                                        type="text"
                                        id="contact"
                                        name="contact"
                                        placeholder="Enter your contact"
                                        className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                        value={user?.phone || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                            <button
                                type="submit"
                                className="bg-blue-500 text-white rounded px-4 py-1.5"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </form>
                    </div>
                </AdminLayout>
            }
        />
    );
};

export default Profile;
