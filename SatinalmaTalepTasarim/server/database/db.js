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

  // Purchase Requests tablosu - SAP B1 OPRQ (Direkt SAP alan adları)
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- SAP OPRQ Fields (PascalCase - Direkt SAP formatı) --
      DocNum TEXT NOT NULL UNIQUE,           -- OPRQ.DocNum
      TaxDate TEXT,                          -- OPRQ.TaxDate
      Reqdate TEXT,                          -- OPRQ.Reqdate
      DocDueDate TEXT,                       -- OPRQ.DocDueDate
      DocDate TEXT NOT NULL,                 -- OPRQ.DocDate
      Reqname TEXT NOT NULL,                 -- OPRQ.Reqname
      U_TalepDurum TEXT DEFAULT 'Satınalma Talebi',  -- OPRQ.U_TalepDurum
      U_AcilMi BOOLEAN DEFAULT 0,            -- OPRQ.U_AcilMi
      U_TalepOzeti TEXT,                     -- OPRQ.U_TalepOzeti
      U_RevizeNedeni TEXT,                   -- OPRQ.U_RevizeNedeni
      U_RedNedeni TEXT,                      -- OPRQ.U_RedNedeni
      Comments TEXT,                         -- OPRQ.Comments
      
      -- Internal Fields --
      itemCount INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Satınalma Talebi',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Request Items tablosu - SAP B1 PRQ1 (Direkt SAP alan adları)
  db.exec(`
    CREATE TABLE IF NOT EXISTS request_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestId INTEGER NOT NULL,
      
      -- SAP PRQ1 Fields (PascalCase - Direkt SAP formatı) --
      OcrCode TEXT NOT NULL,                 -- PRQ1.OcrCode
      ItemCode TEXT NOT NULL,                -- OITM.ItemCode
      ItemName TEXT NOT NULL,                -- OITM.ItemName
      PQTRegdate TEXT NOT NULL,              -- PRQ1.PQTRegdate
      Quantity TEXT NOT NULL,                -- PRQ1.Quantity
      UomCode TEXT NOT NULL,                 -- PRQ1.UomCode
      VendorCode TEXT,                       -- PRQ1.VendorCode
      FreeTxt TEXT,                          -- PRQ1.FreeTxt
      
      -- Internal Fields --
      isDummy BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (requestId) REFERENCES purchase_requests(id) ON DELETE CASCADE
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
    CREATE INDEX IF NOT EXISTS idx_purchase_requests_DocNum ON purchase_requests(DocNum);
    CREATE INDEX IF NOT EXISTS idx_purchase_requests_U_TalepDurum ON purchase_requests(U_TalepDurum);
    CREATE INDEX IF NOT EXISTS idx_request_items_requestId ON request_items(requestId);
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
