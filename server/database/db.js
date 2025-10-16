import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite veritabanı bağlantısı
const db = new Database(path.join(__dirname, 'satinalma.db'), { verbose: console.log });

// Veritabanı tablolarını oluştur
export function initDatabase() {
  // Users tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sap_id TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'purchaser', 'admin')),
      purchase_authority BOOLEAN DEFAULT 0,
      finance_authority BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Purchase Requests tablosu - SAP B1 OPRQ tablosa uygun
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_num TEXT NOT NULL UNIQUE,
      tax_date TEXT,
      req_date TEXT,
      doc_due_date TEXT,
      doc_date TEXT NOT NULL,
      req_name TEXT NOT NULL,
      requester_role TEXT,
      department TEXT NOT NULL,
      item_count INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Satınalma Talebi',
      u_acil_mi BOOLEAN DEFAULT 0,
      u_talep_ozeti TEXT,
      u_revize_nedeni TEXT,
      u_red_nedeni TEXT,
      comments TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Request Items tablosu - SAP B1 PRQ1 tablosuna uygun
  db.exec(`
    CREATE TABLE IF NOT EXISTS request_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      ocr_code TEXT NOT NULL,
      item_code TEXT NOT NULL,
      item_name TEXT NOT NULL,
      pqt_regdate TEXT NOT NULL,
      quantity TEXT NOT NULL,
      uom_code TEXT NOT NULL,
      vendor_code TEXT,
      free_txt TEXT,
      is_dummy BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE
    )
  `);

  // Attachments tablosu - SAP B1 ATC1 tablosuna uygun
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      abs_entry INTEGER,
      line_num INTEGER,
      src_path TEXT,
      trgt_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_ext TEXT,
      file_date TEXT,
      user_sign TEXT,
      copied BOOLEAN DEFAULT 0,
      override BOOLEAN DEFAULT 0,
      free_text TEXT,
      request_id INTEGER,
      item_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES request_items(id) ON DELETE CASCADE
    )
  `);

  // İndeksler
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_sap_id ON users(sap_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_requests_doc_num ON purchase_requests(doc_num);
    CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
    CREATE INDEX IF NOT EXISTS idx_request_items_request_id ON request_items(request_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_request_id ON attachments(request_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_item_id ON attachments(item_id);
  `);

  console.log('✅ Veritabanı tabloları oluşturuldu!');

  // Demo kullanıcıları ekle (eğer yoksa)
  seedUsers();
}

// Demo kullanıcıları ekle
function seedUsers() {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();

  if (existingUsers.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (sap_id, username, password, name, role, purchase_authority, finance_authority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const users = [
      ['SAP001', 'admin', '1234', 'Admin Kullanıcı', 'admin', 1, 1, 'active'],
      ['SAP002', 'satinalma', '1234', 'Satınalma Kullanıcısı', 'purchaser', 1, 0, 'active'],
      ['SAP003', 'user1', '1234', 'Selim Aksu', 'user', 0, 0, 'active'],
      ['SAP004', 'user2', '1234', 'Ayşe Yılmaz', 'user', 0, 0, 'active'],
      ['SAP005', 'finans', '1234', 'Finans Kullanıcısı', 'purchaser', 0, 1, 'active']
    ];

    const insertMany = db.transaction((users) => {
      for (const user of users) {
        insertUser.run(user);
      }
    });

    insertMany(users);
    console.log('✅ Demo kullanıcıları eklendi!');
  }
}

export default db;
