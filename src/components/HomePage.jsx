import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const HomePage = () => {
    const [morangos, setMorangos] = useState(0);
    const [upgradeLevel, setUpgradeLevel] = useState(1);
    const [upgrades, setUpgrades] = useState([
        { id: 1, name: 'Upgrade 1', cost: 50, multiplier: 2, quantity: 0 },
        { id: 2, name: 'Upgrade 2', cost: 100, multiplier: 5, quantity: 0 },
        { id: 3, name: 'Upgrade 3', cost: 200, multiplier: 10, quantity: 0 },
    ]); // Inicializando os upgrades diretamente no estado
    const [showUpgrades, setShowUpgrades] = useState(false);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
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
                let upgradesData = JSON.parse(progressData.upgrades);
                setUpgrades(upgradesData);

                // Recalculate total multiplier
                let totalMultiplier = upgradesData.reduce((sum, upgrade) => sum + upgrade.multiplier * upgrade.quantity, 0);
                setUpgradeLevel(totalMultiplier || 1);
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

    const handleClick = async () => {
        const token = localStorage.getItem('token');
        setIsHarvesting(true);

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
                toast.success('Morangos colhidos com sucesso!');
            } else {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao colher morango');
            }
        } catch (error) {
            toast.error(error.message || 'Erro ao colher morango.');
        } finally {
            setIsHarvesting(false);
        }
    };

    const handleUpgrade = async (upgradeId) => {
        const token = localStorage.getItem('token');
        setIsBuying(true);

        try {
            const response = await fetch('http://localhost:3000/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                },
                body: JSON.stringify({ id: upgradeId }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Erro ao comprar upgrade.');
            }

            const data = await response.json();
            setMorangos(data.strawberries);
            let upgradesData = JSON.parse(data.upgrades);
            setUpgrades(upgradesData);

            // Recalculate total multiplier
            let totalMultiplier = upgradesData.reduce((sum, upgrade) => sum + upgrade.multiplier * upgrade.quantity, 0);
            setUpgradeLevel(totalMultiplier || 1);
            toast.success('Upgrade comprado com sucesso!');
        } catch (error) {
            toast.error(error.message || 'Erro ao comprar upgrade.');
        } finally {
            setIsBuying(false);
        }
    };

    const toggleShowUpgrades = () => {
        setShowUpgrades(prevState => !prevState);  // Alterna a visibilidade dos upgrades
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Bem-vindo, {username}!</h1>
            <div className="mb-4">
                <p className="text-xl">Morangos: {morangos}</p>
                <p className="text-xl">Multiplicador atual: {upgradeLevel}</p>
            </div>
            <button
                onClick={handleClick}
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                disabled={isHarvesting}
            >
                {isHarvesting ? 'Colhendo...' : 'Ganhar Morangos 🍓'}
            </button>

            <div className="mt-8 w-full max-w-md">
                <button
                    onClick={toggleShowUpgrades}
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                >
                    {showUpgrades ? 'Esconder Upgrades Disponíveis' : 'Mostrar Upgrades Disponíveis'}
                </button>

                {showUpgrades && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold mb-4">Upgrades Disponíveis</h2>
                        {upgrades.map((upgrade) => (
                            <div key={upgrade.id} className="mb-4 p-4 bg-white rounded shadow">
                                <p className="text-lg font-semibold">{upgrade.name}</p>
                                <p>Custo: {upgrade.cost} morangos</p>
                                <p>Quantidade: {upgrade.quantity}</p>
                                <p>Multiplicador: x{upgrade.multiplier}</p>
                                <button
                                    onClick={() => handleUpgrade(upgrade.id)}
                                    className={`mt-2 px-4 py-2 font-semibold rounded-lg shadow-md ${
                                        morangos < upgrade.cost ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'
                                    }`}
                                    disabled={isBuying || morangos < upgrade.cost}
                                >
                                    {isBuying ? 'Processando...' : `Comprar ${upgrade.name}`}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
