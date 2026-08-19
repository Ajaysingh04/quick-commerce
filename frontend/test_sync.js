import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/clerk-sync', {
      clerkId: 'test_clerk_id',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '',
      role: 'user'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

test();
