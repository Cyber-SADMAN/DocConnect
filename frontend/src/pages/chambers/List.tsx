import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { IChamber } from '../../interfaces';
import ComponentLoader from '../../components/ComponentLoader';
import { statusType } from '../../types';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Link } from 'react-router-dom';
import Table from '../../components/Table';

const List = () => {
    const [chambers, setChambers] = useState<IChamber[]>([]);
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    const axiosPrivate = useAxiosPrivate();

    const fetchChambers = async () => {
        try {
            const response = await axiosPrivate.get('/chambers');
            setChambers(response.data.data.chambers);
        } catch (error: any) {
            console.log('Error occurs:', error);
            throw error;
        }
    };

    useEffect(() => {
        (async () => {
            try {
                await fetchChambers();
                setStatus({
                    loading: false,
                    error: null,
                });
            } catch (error: any) {
                setStatus({
                    loading: false,
                    error: error.response.data.message,
                });
            }
        })();
    }, []);

    return (
        <ComponentLoader
            status={status}
            component={
                <AdminLayout>
                    <div>
                        <div className="flex justify-between border-b-2 border-b-gray-400 pb-2 mb-4">
                            <h2 className="text-2xl font-bold">Chambers</h2>
                            <Link
                                to="/chambers/create"
                                className="bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
                            >
                                Add Chamber
                            </Link>
                        </div>

                        {chambers.length > 0 ? (
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left py-2 px-4 border-b">
                                            Name
                                        </th>
                                        <th className="text-left py-2 px-4 border-b">
                                            Address
                                        </th>
                                        <th className="text-left py-2 px-4 border-b">
                                            Contact
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
                                    {chambers.map((chamber) => (
                                        <tr
                                            key={chamber._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="py-2 px-4 border-b">
                                                {chamber.name}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {chamber.address}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {chamber.contact}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <span
                                                    className={`px-2 py-.5 rounded text-white ${
                                                        chamber.active
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                >
                                                    {chamber.active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <Link
                                                    to={`/chambers/edit/${chamber._id}`}
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
                            <p>No chambers available for this doctor.</p>
                        )}
                    </div>
                </AdminLayout>
            }
        />
    );
};

export default List;
