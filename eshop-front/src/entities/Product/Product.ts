import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export interface Product {
    id: number,
    name: string,
    description?: string,
    brand?: string,
    price: number,
};

const BASE_URL = 'https://localhost:7078/api/Products'; // Replace with your API endpoint

export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get<Product[]>(BASE_URL);
    return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
    const response = await axios.get<Product>(`${BASE_URL}/${id}`);
    return response.data;
};

export const createProduct = async (product: Product, token: string): Promise<Product> => {
    const response = await axios.post<Product>(BASE_URL, product, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return response.data;
};

export const updateProduct = async (id: number, product: Product, token: string): Promise<Product> => {
    const response = await axios.put<Product>(`${BASE_URL}/${id}`, product, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return response.data;
};

export const deleteProduct = async (id: number, token: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: {Authorization: `Bearer ${token}`}
    });
};


export const useFetchProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                setError('Error fetching products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return { products, loading, error };
};

// Hook to create a product
export const useCreateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createNewProduct = async (product: Product) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            const newProduct = await createProduct(product, token);
            return newProduct; // You can handle the new product as needed
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to create product');
            }
        } finally {
            setLoading(false);
        }
    };

    return { createNewProduct, loading, error };
};

// Hook to update a product
export const useUpdateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateExistingProduct = async (id: number, product: Product) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            const updatedProduct = await updateProduct(id, product, token);
            return updatedProduct; // Handle the updated product as needed
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to update product');
            }
        } finally {
            setLoading(false);
        }
    };

    return { updateExistingProduct, loading, error };
};

// Hook to delete a product
export const useDeleteProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteExistingProduct = async (id: number) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            await deleteProduct(id, token);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to delete product');
            }
        } finally {
            setLoading(false);
        }
    };

    return { deleteExistingProduct, loading, error };
};

// Hook to fetch a single product by ID
export const useFetchProductById = (id: number) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                setError('Error fetching product');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    return { product, loading, error };
};