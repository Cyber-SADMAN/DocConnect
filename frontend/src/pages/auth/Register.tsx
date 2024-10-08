import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import ComponentLoader from '../../components/ComponentLoader';
import useAuth from '../../hooks/useAuth';
import { statusType } from '../../types';
import RootLayout from '../../components/layouts/RootLayout';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });
    const [error, setError] = useState<string>('');
    const { setAuth } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            formData.name.trim() === '' ||
            formData.email.trim() === '' ||
            formData.password.trim() === ''
        ) {
            return setError('Please fill in all fields');
        }

        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/auth/register', formData);
            const data = await response.data;
            const msg = await response.data.message;
            const respData = await response.data.data;
            console.log(data);
            setAuth({
                token: respData.accessToken,
                name: respData.user.name,
                email: respData.user.email,
                role: respData.user.role,
            });
            setLoading(false);
            setFormData({
                name: '',
                email: '',
                password: '',
            });
            toast.success(msg);

            navigate('/dashboard');
        } catch (error: any) {
            setLoading(false);

            if (error.response.status == 422) {
                if (typeof error.response.data.message === 'string') {
                    setError(error.response.data.message);
                } else {
                    // if the message is an object, then we need to get the first key-value pair
                    const key = Object.keys(error.response.data.message)[0];
                    setError(error.response.data.message[key]);
                }
            } else {
                setError(error.response.data.message);
            }
        }
    };

    // set status loading to false when the component mounts
    if (status.loading) {
        setStatus({
            loading: false,
            error: null,
        });
    }

    return (
        <ComponentLoader
            status={status}
            component={
                <RootLayout>
                    <div className="flex items-center justify-center mt-8 lg:mt-24">
                        <div className="bg-white p-6 md:px-8 rounded shadow-md w-96">
                            <h1 className="text-2xl font-semibold mb-6">
                                Doctor Registration
                            </h1>

                            {error && (
                                <div className="bg-red-500 text-white px-3 py-1 rounded-md mb-4">
                                    {error}

                                    <button
                                        className="float-right focus:outline-none"
                                        onClick={() => setError('')}
                                    >
                                        <span className=" font-semibold">
                                            &times;
                                        </span>
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="name"
                                        className="block text-md font-semibold"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 px-3 py-2 w-full border rounded-md focus:outline-blue-700"
                                        placeholder="Enter your name"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="email"
                                        className="block text-md font-semibold"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 px-3 py-2 w-full border rounded-md focus:outline-blue-700"
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="password"
                                        className="block text-md font-semibold"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="mt-1 px-3 py-2 w-full border rounded-md focus:outline-blue-700"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full bg-blue-600 text-white px-3 py-2 rounded-md text-md hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800 ${
                                        loading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Register'}
                                </button>
                            </form>

                            <div className="text-center mt-5">
                                <p className="text-gray-600 text-md font-sm">
                                    Already have an account?{' '}
                                    <span>
                                        <Link
                                            className="text-blue-800"
                                            to="/login"
                                        >
                                            Login
                                        </Link>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </RootLayout>
            }
        />
    );
};

export default Register;
