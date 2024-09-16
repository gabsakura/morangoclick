import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Upgrades = ({ token }) => {
  const [upgrades, setUpgrades] = useState([]);
  const [strawberries, setStrawberries] = useState(0);
  const [isBuying, setIsBuying] = useState(false);
  const [upgradesAvailable, setUpgradesAvailable] = useState(false); // Controla se os upgrades estão liberados

  // Carregar upgrades disponíveis
  useEffect(() => {
    axios.get('http://localhost:3000/upgrades', {
      headers: { 'x-access-token': token }
    })
    .then(response => {
      setUpgrades(response.data);  // Recebe os upgrades do backend
    })
    .catch(error => {
      toast.error("Erro ao buscar upgrades: " + error.message);
    });
  }, [token]);

  // Função para colher morangos
  const handleHarvest = () => {
    axios.post('http://localhost:3000/harvest', {}, {
      headers: { 'x-access-token': token }
    })
    .then(response => {
      setStrawberries(response.data.strawberries);
      toast.success('Morangos colhidos com sucesso!');
    })
    .catch(error => {
      toast.error("Erro ao colher morangos: " + error.message);
    });
  };

  // Função para comprar upgrade
  const handleBuyUpgrade = (id) => {
    setIsBuying(true);
    axios.post('http://localhost:3000/buy', { id }, {
      headers: { 'x-access-token': token }
    })
    .then(response => {
      setStrawberries(response.data.strawberries);  // Atualiza o número de morangos
      toast.success('Upgrade comprado com sucesso!');
    })
    .catch(error => {
      toast.error("Erro ao comprar upgrade: " + error.message);
    })
    .finally(() => {
      setIsBuying(false);
    });
  };

  // Função para liberar os upgrades
  const handleUnlockUpgrades = () => {
    setUpgradesAvailable(true);
    toast.success('Upgrades liberados!');
  };

  return (
    <div className="mt-4">
      <h2>Morangos: {strawberries}</h2>
      <button onClick={handleHarvest} className="px-4 py-2 bg-green-500 text-white rounded-lg">Colher Morangos</button>

      {/* Botão para liberar os upgrades */}
      {!upgradesAvailable && (
        <button 
          onClick={handleUnlockUpgrades} 
          className="mt-4 px-4 py-2 bg-yellow-500 text-white font-bold rounded-lg"
        >
          Liberar Upgrades
        </button>
      )}

      {/* Mostra upgrades apenas se foram liberados */}
      {upgradesAvailable && (
        <div>
          <h2 className="mt-8">Upgrades Disponíveis:</h2>
          {upgrades.length === 0 ? (
            <p>Carregando upgrades...</p>
          ) : (
            upgrades.map(upgrade => (
              <div key={upgrade.id} className="mt-4 p-4 bg-white rounded shadow">
                <h3>{upgrade.name} - Custo: {upgrade.cost} morangos - Multiplicador: x{upgrade.multiplier}</h3>
                <button 
                  onClick={() => handleBuyUpgrade(upgrade.id)} 
                  disabled={strawberries < upgrade.cost || isBuying}
                  className={`px-4 py-2 rounded-lg shadow ${strawberries < upgrade.cost ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
                >
                  {isBuying ? 'Processando...' : `Comprar ${upgrade.name}`}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Upgrades;
