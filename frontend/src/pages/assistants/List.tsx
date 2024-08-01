import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Link } from 'react-router-dom';
import ComponentLoader from '../../components/ComponentLoader';
import { statusType } from '../../types';
import { IAssistant } from '../../interfaces';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const Assistants = () => {
    const [assistants, setAssistants] = useState<IAssistant[]>([]);
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        fetchAssistants();
    }, []);

    const fetchAssistants = async () => {
        try {
            const response = await axiosPrivate.get('/users/assistants');
            setAssistants(response.data.data.assistants);
            setStatus({ loading: false, error: null });
        } catch (error: any) {
            console.log(
                'Error fetching assistants:',
                error.response.data.message
            );
            setStatus({ loading: false, error: error.response.status || 500 });
        }
    };

    return (
        <ComponentLoader
            status={status}
            component={
                <AdminLayout>
                    <div>
                        <div className="flex justify-between border-b-2 border-b-gray-400 pb-2 mb-4">
                            <h2 className="text-2xl font-bold">Assistants</h2>
                            <Link
                                to="/assistants/create"
                                className="bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
                            >
                                Add Assistant
                            </Link>
                        </div>
                        {assistants.length > 0 ? (
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left py-2 px-4 border-b">
                                            Name
                                        </th>
                                        <th className="text-left py-2 px-4 border-b">
                                            Email
                                        </th>
                                        <th className="text-left py-2 px-4 border-b">
                                            Phone
                                        </th>
                                        <th className="text-left py-2 px-4 border-b">
                                            Chamber
                                        </th>
                                        <th className="text-left py-2 px-4 border-b">
                                            Active
                                        </th>
                                        <th className="text-left py-2 px-4 border-b">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assistants.map((assistant: IAssistant) => (
                                        <tr
                                            key={assistant._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="py-2 px-4 border-b">
                                                {assistant.name}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {assistant.email}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {assistant.phone}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {assistant.assignedChamberName}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <span
                                                    className={`px-2 py-.5 rounded text-white ${
                                                        assistant.active
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                >
                                                    {assistant.active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <Link
                                                    to={`/assistants/edit/${assistant._id}`}
                                                    className="bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No assistants available for this doctor.</p>
                        )}
                    </div>
                </AdminLayout>
            }
        />
    );
};

export default Assistants;
