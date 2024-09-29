import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface NewsItem 
{
    id: number,
    title: string,
    description? : string,
    text? : string
}

const BASE_URL = 'https://localhost:7078/api/NewsItems';

export const getNews = async (): Promise<NewsItem[]> => {
    const response = await axios.get<NewsItem[]>(BASE_URL);
    return response.data;
}

export const getNewsById = async (id: number): Promise<NewsItem> => {
    const response = await axios.get<NewsItem>(`${BASE_URL}/${id}`);
    return response.data;
}

export const createNews = async (news: NewsItem, token: string): Promise<NewsItem> => {
    const response = await axios.post<NewsItem>(BASE_URL, news, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return response.data;
}

export const updateNews = async (id: number, news: NewsItem, token: string): Promise<NewsItem> => {
    const response = await axios.put<NewsItem>(`${BASE_URL}/${id}`, news, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return response.data;
}

export const deleteNews = async (id: number, token: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: {Authorization: `Bearer ${token}`}
    });
}

export const useFetchNews = () => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () =>
        {
            try {
                const data = await getNews();
                setNewsItems(data);
            } catch (err) {
                setError('Error fetching news');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return { newsItems, loading, error };
}

export const useCreateNews = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createNewNews = async (news: NewsItem) =>
    {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            const newNews = await createNews(news, token);
            return newNews;
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to create news');
            }
        } finally {
            setLoading(false);
        }
    };

    return { createNewNews, loading, error };
}

export const useUpdateNews = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateExistingNews = async (id: number, news: NewsItem) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            const updatedProduct = await updateNews(id, news, token);
            return updatedProduct; // Handle the updated news as needed
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to update news');
            }
        } finally {
            setLoading(false);
        }
    };

    return { updateExistingNews, loading, error };
};

export const useDeleteNews = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteExistingNews = async (id: number) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login')
            return;
        }
        try {
            await deleteNews(id, token);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Navigate to login if the token is invalid or expired
                navigate('/login');
            }
            else {
            setError('Failed to delete news');
            }
        } finally {
            setLoading(false);
        }
    };

    return { deleteExistingNews, loading, error };
};

export const useFetchnewsById = (id: number) => {
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await getnewsById(id);
                setNews(data);
            } catch (err) {
                setError('Error fetching news');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNews();
        }
    }, [id]);

    return { news, loading, error };
};