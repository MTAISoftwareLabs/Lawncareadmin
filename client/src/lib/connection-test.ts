export async function testBackendConnection() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
}

export async function testAPIEndpoints() {
  const tests = [
    { name: 'Products API', url: '/api/products' },
    { name: 'Featured Products API', url: '/api/products?featured=true' },
  ];

  console.log('🔍 Testing API endpoints...');
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      console.log(`✅ ${test.name}: OK (${Array.isArray(data) ? data.length : 0} items)`);
    } catch (error) {
      console.error(`❌ ${test.name}: FAILED`, error);
    }
  }
}
