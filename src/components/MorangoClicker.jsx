
import React, { useState } from 'react';

const MorangoClicker = () => {
  const [morangos, setMorangos] = useState(0); // Inicializa os morangos com 0

  const handleColherMorango = async () => {
    try {
      const response = await fetch('http://localhost:3000/harvest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('token'), // Supondo que o token seja armazenado no localStorage
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMorangos(data.strawberries); // Atualiza os morangos com a quantidade vinda do backend
      } else {
        throw new Error('Erro ao colher morango');
      }
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  return (
    <div>
      <h1>Morangos: {morangos}</h1>
      <button onClick={handleColherMorango}>Colher Morango</button>
    </div>
  );
};

export default MorangoClicker;
