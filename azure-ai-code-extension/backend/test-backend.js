const axios = require('axios');

async function testBackend() {
    const payload = {
        language: 'typescript',
        currentLine: '// connect to blob storage',
        context: '',
        imports: []
    };

    try {
        console.log('Testing backend with payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post('http://127.0.0.1:3005/suggest', payload);
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('Error testing backend:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

testBackend();
