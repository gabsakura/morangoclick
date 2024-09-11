import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomePage = () => {
    const [morangos, setMorangos] = useState(0);
    const [upgradeLevel, setUpgradeLevel] = useState(1);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);  // Novo estado para carregamento
    const [isProcessing, setIsProcessing] = useState(false);  // Novo estado para processamentos
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
        } else {
            // Fetch the user data from the backend
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
                let upgrades = JSON.parse(progressData.upgrades);
                let totalMultiplier = upgrades.reduce((sum, upgrade) => sum + upgrade.multiplier, 0);
                setUpgradeLevel(totalMultiplier || 1);
                setUsername(profileData.username);
                setIsLoading(false); // Desabilitar o carregamento após sucesso
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

    const handleClick = async () => {
        const token = localStorage.getItem('token');
        setIsProcessing(true); // Iniciar processamento

        try {
            const response = await fetch('http://localhost:3000/harvest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMorangos(data.strawberries); // Atualiza os morangos com a quantidade vinda do backend
            } else {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao colher morango');
            }
        } catch (error) {
            console.error('Erro:', error.message);
            toast.error(error.message || 'Erro ao colher morango.');
        } finally {
            setIsProcessing(false); // Finalizar processamento
        }
    };

    const handleUpgrade = async () => {
        const token = localStorage.getItem('token');
        setIsProcessing(true); // Iniciar processamento

        try {
            const response = await fetch('http://localhost:3000/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                },
                body: JSON.stringify({ id: 1 }), // Comprar upgrade com id 1
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao atualizar o upgrade.');
            }

            const data = await response.json();
            setMorangos(data.strawberries);
            let upgrades = JSON.parse(data.upgrades);
            let totalMultiplier = upgrades.reduce((sum, upgrade) => sum + upgrade.multiplier, 0);
            setUpgradeLevel(totalMultiplier || 1);
        } catch (error) {
            toast.error(error.message || 'Erro ao atualizar o upgrade.');
        } finally {
            setIsProcessing(false); // Finalizar processamento
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>; // Placeholder enquanto os dados estão sendo carregados
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Bem-vindo, {username}!</h1>
            <div className="mb-4">
                <p className="text-xl">Morangos: {morangos}</p>
                <p className="text-xl">Nível do Upgrade: {upgradeLevel}</p>
            </div>
            <div>
                <button
                    onClick={handleClick}
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                    disabled={isProcessing} // Desabilitar botão enquanto processa
                >
                    Ganhar Morangos 🍓
                </button>
                <button
                    onClick={handleUpgrade}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                    disabled={isProcessing} // Desabilitar botão enquanto processa
                >
                    Comprar Upgrade 🔼
                </button>
            </div>
            <button
                onClick={handleLogout}
                className="mt-8 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
            >
                Logout
            </button>
            <ToastContainer />
        </div>
    );
};

export default HomePage;
