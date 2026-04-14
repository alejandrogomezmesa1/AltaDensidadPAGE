(async () => {
  try {
    const resp = await fetch('http://localhost:3000/api/mercadopago/create_preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: '1', name: 'Prueba', price: 10000, quantity: 1 }] })
    });
    const data = await resp.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
