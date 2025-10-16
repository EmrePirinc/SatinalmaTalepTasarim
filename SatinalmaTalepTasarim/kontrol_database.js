import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database'e bağlan
const db = new Database(path.join(__dirname, 'server/database/satinalma.db'));

console.log('\n🔍 DATABASE KONTROL RAPORU');
console.log('════════════════════════════════════════\n');

// 1. Kullanıcıları kontrol et
console.log('📊 USERS (Kullanıcılar):');
console.log('─────────────────────────────────────');
const users = db.prepare('SELECT * FROM users').all();
console.log(`Toplam kullanıcı: ${users.length}\n`);

if (users.length > 0) {
  users.forEach(user => {
    console.log(`✓ ${user.name}`);
    console.log(`  - SAP ID: ${user.sap_id}`);
    console.log(`  - Kullanıcı Adı: ${user.username}`);
    console.log(`  - Rol: ${user.role}`);
    console.log(`  - Satınalma Yetkisi: ${user.purchase_authority ? 'Evet' : 'Hayır'}`);
    console.log(`  - Finans Yetkisi: ${user.finance_authority ? 'Evet' : 'Hayır'}`);
    console.log(`  - Durum: ${user.status}`);
    console.log(`  - Oluşturulma: ${user.created_at}\n`);
  });
} else {
  console.log('❌ Hiç kullanıcı yok!\n');
}

// 2. Talepleri kontrol et
console.log('📊 PURCHASE_REQUESTS (Satınalma Talepleri):');
console.log('─────────────────────────────────────');
const requests = db.prepare('SELECT * FROM purchase_requests').all();
console.log(`Toplam talep: ${requests.length}\n`);

if (requests.length > 0) {
  requests.forEach(req => {
    console.log(`✓ Talep #${req.doc_num}`);
    console.log(`  - Talep Eden: ${req.req_name}`);
    console.log(`  - Departman: ${req.department}`);
    console.log(`  - Durum: ${req.status}`);
    console.log(`  - Acil: ${req.u_acil_mi ? 'Evet' : 'Hayır'}`);
    console.log(`  - Oluşturulma: ${req.created_at}\n`);
  });
} else {
  console.log('ℹ️  Henüz talep oluşturulmamış.\n');
}

// 3. Talep kalemlerini kontrol et
console.log('📊 REQUEST_ITEMS (Talep Kalemleri):');
console.log('─────────────────────────────────────');
const items = db.prepare('SELECT * FROM request_items').all();
console.log(`Toplam kalem: ${items.length}\n`);

// 4. Ekleri kontrol et
console.log('📊 ATTACHMENTS (Ekler):');
console.log('─────────────────────────────────────');
const attachments = db.prepare('SELECT * FROM attachments').all();
console.log(`Toplam ek: ${attachments.length}\n`);

// 5. Tablo istatistikleri
console.log('📈 GENEL İSTATİSTİKLER:');
console.log('════════════════════════════════════════');
console.log(`✓ Kullanıcılar: ${users.length}`);
console.log(`✓ Talepler: ${requests.length}`);
console.log(`✓ Kalemler: ${items.length}`);
console.log(`✓ Ekler: ${attachments.length}`);
console.log('\n');

// 6. Database durumu
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all();

console.log('📋 OLUŞTURULAN TABLOLAR:');
console.log('─────────────────────────────────────');
tables.forEach(table => {
  console.log(`  ✓ ${table.name}`);
});
console.log('\n');

// Database'i kapat
db.close();

console.log('✅ Kontrol tamamlandı!\n');

