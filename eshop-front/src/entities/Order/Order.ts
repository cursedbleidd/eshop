import { Product } from "../Product/Product.ts";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = 'https://localhost:7078/api/Order';

export interface Order {
    id: number,
    userid: number,
    destination?: string,
    status?: string,
    nameRec?: string,
    surnameRec?: string,
    orderItems: OrderItem[],
}

export interface OrderItem {
    id: number,
    orderid: number,
    productid: number,
    quantity: number,
    product: Product,
}

export interface OrderItemRequest {
    quantity: number,
    product: Product,
}

export interface OrderRequest {
    destination?: string,
    nameRec?: string,
    surnameRec?: string,
    orderItems: OrderItemRequest[],
}

export const getOrders = async (token: string): Promise<Order[]> => {
    const response = await axios.get<Order[]>(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createOrder = async (orderRequest: OrderRequest, token: string): Promise<Order> => {
    const response = await axios.post<Order>(BASE_URL, orderRequest, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
export const putOrder = async (id: number, order: Order, token: string): Promise<Order> => {
    const response = await axios.put<Order>(`${BASE_URL}/${id}`, order, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteOrder = async (id: number, token: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const useFetchOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            const data = await getOrders(token);
            setOrders(data.reverse());
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to fetch orders');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return { orders, loading, error, fetchOrders };
};

export const useCreateOrder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createNewOrder = async (orderRequest: OrderRequest) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            const newOrder = await createOrder(orderRequest, token);
            return newOrder; // Handle the new order as needed
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to create order');
            }
        } finally {
            setLoading(false);
        }
    };

    return { createNewOrder, loading, error };
};

export const useDeleteOrder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteExistingOrder = async (id: number) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            await deleteOrder(id, token);
        }  catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to delete order');
            }
        } finally {
            setLoading(false);
        }
    };

    return { deleteExistingOrder, loading, error };
};

export const useUpdateOrder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateOrder = async (id: number, order: Order) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            const newOrder = await putOrder(id, order, token);
            return newOrder; // Handle the new order as needed
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to update order');
            }
        } finally {
            setLoading(false);
        }
    };

    return { updateOrder, loading, error };
};
