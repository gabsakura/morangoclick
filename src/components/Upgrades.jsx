import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Upgrades = ({ token }) => {
  const [upgrades, setUpgrades] = useState([]);
  const [strawberries, setStrawberries] = useState(0);

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

  // Função para colher morangos
  const handleHarvest = () => {
    axios.post('http://localhost:3000/harvest', {}, {
      headers: { 'x-access-token': token }
    })
    .then(response => {
      setStrawberries(response.data.strawberries);
    })
    .catch(error => {
      console.error("Erro ao colher morangos:", error);
    });
  };

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
      <h1>Morangos: {strawberries}</h1>
      <button onClick={handleHarvest}>Colher Morangos</button>

      <h2>Upgrades Disponíveis:</h2>
      {upgrades.map(upgrade => (
        <div key={upgrade.id}>
          <h3>{upgrade.name} - Custo: {upgrade.cost} - Multiplicador: {upgrade.multiplier}</h3>
          <button onClick={() => handleBuyUpgrade(upgrade.id)}>Comprar {upgrade.name}</button>
        </div>
      ))}
    </div>
  );
};

export default Upgrades;
