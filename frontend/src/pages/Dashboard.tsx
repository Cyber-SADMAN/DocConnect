import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import ComponentLoader from '../components/ComponentLoader';
import AdminLayout from '../components/layouts/AdminLayout';
import { statusType } from '../types';
import { IDashboardData } from '../interfaces';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Table from '../components/Table';

const Dashboard = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [dashboardData, setDashboardData] = useState<IDashboardData>({
        totalAppointments: 0,
        totalChambers: 0,
        totalAppointmentsToday: 0,
        totalAppointmentsThisWeek: 0,
        totalAppointmentsThisMonth: 0,
        totalAppointmentsThisYear: 0,
        totalAppointmentsThisYearByMonth: [],
        totalPatients: 0,
        totalDoctors: 0,
        totalAssistants: 0,
        todaysAppointments: [],
        chamberWiseAppointmentsCount: [],
        doctorWiseAppointmentsCount: [],
    });
    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosPrivate.get('/dashboard');
                setDashboardData(response.data.data);
                setStatus({ loading: false, error: null });
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            }
        };

        fetchData();
    }, []);

    return (
        <ComponentLoader
            status={status}
            component={
                <AdminLayout>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {auth.role === 1 && (
                                <>
                                    <Tile
                                        label="Total Appointments"
                                        value={dashboardData.totalAppointments}
                                    />
                                    <Tile
                                        label="Total Patients"
                                        value={dashboardData.totalPatients}
                                    />
                                    <Tile
                                        label="Total Doctors"
                                        value={dashboardData.totalDoctors}
                                    />
                                    <Tile
                                        label="Total Chambers"
                                        value={dashboardData.totalChambers}
                                    />
                                </>
                            )}
                            {auth.role === 2 && (
                                <>
                                    <Tile
                                        label="Today's Appointments"
                                        value={
                                            dashboardData.totalAppointmentsToday
                                        }
                                    />
                                    <Tile
                                        label="Total Appointments"
                                        value={dashboardData.totalAppointments}
                                    />
                                    <Tile
                                        label="Total Patients"
                                        value={dashboardData.totalPatients}
                                    />
                                    <Tile
                                        label="Total Assistants"
                                        value={dashboardData.totalAssistants}
                                    />
                                    <Tile
                                        label="Total Chambers"
                                        value={dashboardData.totalChambers}
                                    />
                                </>
                            )}
                            {auth.role === 3 && (
                                <>
                                    <Tile
                                        label="Today's Appointments"
                                        value={
                                            dashboardData.totalAppointmentsToday
                                        }
                                    />
                                    <Tile
                                        label="Total Appointments"
                                        value={dashboardData.totalAppointments}
                                    />
                                    <Tile
                                        label="Total Patients"
                                        value={dashboardData.totalPatients}
                                    />
                                </>
                            )}
                        </div>
                        <div>
                            {auth.role === 2 && (
                                <>
                                    <Table
                                        title="Today's Appointments"
                                        data={dashboardData.todaysAppointments}
                                        columns={[
                                            'Patient Name',
                                            'Patient Email',
                                            'Chamber Name',
                                            'Serial No',
                                        ]}
                                        columnFields={[
                                            'patientName',
                                            'patientEmail',
                                            'chamberName',
                                            'serialNo',
                                        ]}
                                        className="mb-6"
                                        fallback="No appointments available today"
                                    />
                                    <Table
                                        title="Chamber-wise Appointments Count"
                                        data={
                                            dashboardData.chamberWiseAppointmentsCount
                                        }
                                        columns={[
                                            'Chamber Name',
                                            'Address',
                                            'Appointment Count',
                                        ]}
                                        columnFields={[
                                            'chamberName',
                                            'address',
                                            'appointmentCount',
                                        ]}
                                        className="mb-6"
                                        fallback="No appointments available today"
                                    />
                                </>
                            )}
                            {auth.role === 3 && (
                                <Table
                                    title="Today's Appointments"
                                    data={dashboardData.todaysAppointments}
                                    columns={[
                                        'Patient Name',
                                        'Patient Email',
                                        'Serial No',
                                    ]}
                                    columnFields={[
                                        'patientName',
                                        'patientEmail',
                                        'serialNo',
                                    ]}
                                    className="mb-6"
                                    fallback="No appointments available today"
                                />
                            )}
                            {auth.role === 1 && (
                                <Table
                                    title="Doctor-wise Appointments Count"
                                    data={
                                        dashboardData.doctorWiseAppointmentsCount
                                    }
                                    columns={[
                                        'Doctor Name',
                                        'Appointment Count',
                                    ]}
                                    columnFields={[
                                        'doctorName',
                                        'appointmentCount',
                                    ]}
                                    className="mb-6"
                                />
                            )}
                        </div>
                    </div>
                </AdminLayout>
            }
        />
    );
};

const Tile = ({ label, value }: { label: string; value: number }) => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold mb-2">{label}</h3>
        <p className="text-2xl">{value}</p>
    </div>
);

export default Dashboard;
