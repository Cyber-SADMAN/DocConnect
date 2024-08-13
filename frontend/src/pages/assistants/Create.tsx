import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layouts/AdminLayout';
import ComponentLoader from '../../components/ComponentLoader';
import { IAssistant, IChamber } from '../../interfaces';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const CreateAssistant = () => {
    const [assistant, setAssistant] = useState<IAssistant>({
        name: '',
        email: '',
        phone: '',
        assignedChamber: '',
        password: '',
    } as IAssistant);
    const [chambers, setChambers] = useState<
        { value: string; label: string }[]
    >([]);
    const [status, setStatus] = useState({ loading: true, error: null });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        fetchChambers();
    }, []);

    const fetchChambers = async () => {
        try {
            const response = await axiosPrivate.get('/chambers');
            const _chambers = response.data.data.chambers.map(
                (chamber: IChamber) => ({
                    value: chamber._id,
                    label: chamber.name,
                })
            );
            setChambers(_chambers);

            setStatus({ loading: false, error: null });
        } catch (error: any) {
            console.log(
                'Error fetching chambers:',
                error.response.data.message
            );
            setStatus({ loading: false, error: error.response.status || 500 });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (assistant.assignedChamber === '') {
                return toast.error('Please select a chamber');
            }
            await axiosPrivate.post('/users/assistants', assistant);
            toast.success('Assistant created successfully');
            navigate('/assistants');
        } catch (error: any) {
            console.log('Error occurs on submit:', error);
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
                        Add New Assistant
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
                                    placeholder="Enter the name"
                                    className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                    value={assistant.name}
                                    required
                                    onChange={(e) =>
                                        setAssistant({
                                            ...assistant,
                                            name: e.target.value,
                                        })
                                    }
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
                                    type="text"
                                    id="email"
                                    placeholder="Enter the email"
                                    className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                    value={assistant.email}
                                    required
                                    onChange={(e) =>
                                        setAssistant({
                                            ...assistant,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mb-2">
                                <label
                                    className="font-semibold block mb-1"
                                    htmlFor="phone"
                                >
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    placeholder="Enter the phone"
                                    className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                    value={assistant.phone}
                                    required
                                    onChange={(e) =>
                                        setAssistant({
                                            ...assistant,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mb-2">
                                <label
                                    className="font-semibold block mb-1"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="text"
                                    placeholder="Enter the password"
                                    className="w-full mb-2 px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-blue-500"
                                    value={assistant.password}
                                    required
                                    onChange={(e) =>
                                        setAssistant({
                                            ...assistant,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mb-4">
                                <label className="font-semibold block mb-1">
                                    Assigned Chamber
                                </label>
                                <Select
                                    value={chambers.find(
                                        (chamber) =>
                                            chamber.value ===
                                            assistant.assignedChamber
                                    )}
                                    onChange={(option) =>
                                        setAssistant({
                                            ...assistant,
                                            assignedChamber: option
                                                ? option.value
                                                : '',
                                        })
                                    }
                                    placeholder="Select a chamber"
                                    options={chambers}
                                    isClearable
                                    className="w-full"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </form>
                    </div>
                </AdminLayout>
            }
        />
    );
};

export default CreateAssistant;
