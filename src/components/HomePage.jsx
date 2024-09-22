import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Upgrades from './Upgrades'; // Importa o componente Upgrades

const HomePage = () => {
    const [morangos, setMorangos] = useState(0);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
    
        if (!token) {
            navigate('/login');
        } else {
            // Fetch user progress and profile from backend
            Promise.all([
                fetch('http://localhost:3000/progress', {
                    headers: { 'x-access-token': token }
                }),
                fetch('http://localhost:3000/profile', {
                    headers: { 'x-access-token': token }
                })
            ])
                .then(async ([progressRes, profileRes]) => {
                    if (!progressRes.ok || !profileRes.ok) {
                        throw new Error('Falha ao carregar dados do usuário.');
                    }
                    const progressData = await progressRes.json();
                    const profileData = await profileRes.json();
    
                    setMorangos(progressData.strawberries);
                    setUsername(profileData.username);
                    setIsLoading(false);
                })
                .catch(error => {
                    toast.error(error.message || 'Falha ao carregar dados do usuário.');
                    setIsLoading(false);
                });
        }
    }, [navigate]);
    

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <h1 className="text-3xl font-bold mb-4">
            {username ? `Bem-vindo, ${username}!` : 'Carregando dados...'}
          </h1>
      
          {/* Componente de Upgrades */}
          <Upgrades token={localStorage.getItem('token')} />
      
          <button
            onClick={handleLogout}
            className="mt-8 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      );
      
};

export default HomePage;
