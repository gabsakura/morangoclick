import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Upgrades = ({ token, strawberries, setStrawberries }) => {
  const [upgrades, setUpgrades] = useState([]);

  // Carregar upgrades disponíveis
  useEffect(() => {
    axios.get('http://localhost:3000/upgrades', {
      headers: { 'x-access-token': token }
    })
    .then(response => {
      setUpgrades(response.data);
    })
    .catch(error => {
      console.error("Erro ao buscar upgrades:", error);
    });
  }, [token]);

  // Função para comprar upgrade
  const handleBuyUpgrade = (id) => {
    axios.post('http://localhost:3000/buy', { id }, {
      headers: { 'x-access-token': token }
    })
    .then(response => {
      setStrawberries(response.data.strawberries);
    })
    .catch(error => {
      console.error("Erro ao comprar upgrade:", error);
    });
  };

  return (
    <div>
      <h2>Upgrades Disponíveis:</h2>
      {upgrades.map(upgrade => (
        <div key={upgrade.id} className="mb-4 p-4 bg-white rounded shadow">
          <p className="text-lg font-semibold">{upgrade.name}</p>
          <p>Custo: {upgrade.cost} morangos</p>
          <p>Multiplicador: x{upgrade.multiplier}</p>
          <button
            onClick={() => handleBuyUpgrade(upgrade.id)}
            className={`mt-2 px-4 py-2 font-semibold rounded-lg shadow-md ${
              strawberries < upgrade.cost ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
            disabled={strawberries < upgrade.cost}
          >
            Comprar {upgrade.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Upgrades;
