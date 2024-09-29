import axios from "axios"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Order } from "../Order/Order";

const BASE_URL = 'https://localhost:7078/api/User'

export interface User {
    id: number,
    name: string,
    email: string,
    accType: number,
    orders: Order[]
}

export const getUsers = async (token: string) : Promise<User[]> => {
    const response = await axios.get<User[]>(BASE_URL, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return response.data;
}

export const deleteUser = async (id: number, token: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: {Authorization: `Bearer ${token}`}
    });
}

export const useFetchUsers = () =>
{
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) { 
                navigate('/login')
                return;
            }
            try {
                const data = await getUsers(token);
                setUsers(data);
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    // Navigate to login if the token is invalid or expired
                    navigate('/login');
                }
                else {
                setError('Failed to fetch user');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error };
}
export const useDeleteUser = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const deleteExistingUser = async (id: number) => {
        console.log(id);
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            await deleteUser(id, token);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to delete user');
            }
        } finally {
            setLoading(false);
        }
    };

    return { deleteExistingUser, loading, error }
}