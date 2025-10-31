import bcrypt from 'bcrypt';

async function testPassword() {
  const password = 'password';
  const hash = '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJByJpDdHp8nJ5Q8K2a';

  console.log('Testing password:', password);
  console.log('Testing hash:', hash);

  const isValid = await bcrypt.compare(password, hash);
  console.log('Password valid:', isValid);

  // Создадим новый хеш
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash:', newHash);

  const isValidNew = await bcrypt.compare(password, newHash);
  console.log('New password valid:', isValidNew);
}

testPassword().catch(console.error);
