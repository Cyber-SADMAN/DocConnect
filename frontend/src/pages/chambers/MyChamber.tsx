import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import ComponentLoader from '../../components/ComponentLoader';
import { statusType } from '../../types';

const MyChamber = () => {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const [status, setStatus] = useState<statusType>({
        loading: true,
        error: null,
    });

    const fetchMyChamber = async () => {
        try {
            const response = await axiosPrivate.get('/chambers/my-chamber');
            const chamberId = response.data.data.chamber.id;
            setStatus({ loading: false, error: null });
            navigate(`/chambers/edit/${chamberId}`);
        } catch (error: any) {
            throw error;
        }
    };

    useEffect(() => {
        fetchMyChamber();
    }, []);

    return <ComponentLoader status={status} component={<></>} />;
};

export default MyChamber;
