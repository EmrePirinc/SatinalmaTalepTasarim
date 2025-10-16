import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'server/database/satinalma.db'));

console.log('\n🔧 Kullanıcı Şifrelerini Güncelleme\n');

// Tüm kullanıcıların şifresini güncelle
const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'satinalma', password: '1234' },
  { username: 'user1', password: '1234' },
  { username: 'user2', password: '1234' },
  { username: 'finans', password: '1234' }
];

const updatePassword = db.prepare('UPDATE users SET password = ? WHERE username = ?');

users.forEach(user => {
  updatePassword.run(user.password, user.username);
  console.log(`✓ ${user.username} şifresi güncellendi: ${user.password}`);
});

console.log('\n📊 Güncel Kullanıcı Bilgileri:\n');

const allUsers = db.prepare('SELECT username, password, name, role FROM users').all();
allUsers.forEach(user => {
  console.log(`${user.name}`);
  console.log(`  Kullanıcı Adı: ${user.username}`);
  console.log(`  Şifre: ${user.password}`);
  console.log(`  Rol: ${user.role}\n`);
});

db.close();
console.log('✅ Tamamlandı!\n');

