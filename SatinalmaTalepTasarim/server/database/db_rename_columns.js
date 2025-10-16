/**
 * Database Column Rename - SAP Format
 * Kolon adlarını SAP formatına (PascalCase) çevir
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'satinalma.db'));

console.log('🔄 Database Kolonları SAP Formatına Çevriliyor...\n');

try {
  // Backup oluştur
  db.exec(`DROP TABLE IF EXISTS purchase_requests_old_columns;`);
  db.exec(`ALTER TABLE purchase_requests RENAME TO purchase_requests_old_columns;`);
  console.log('✅ Backup oluşturuldu: purchase_requests_old_columns\n');

  // Yeni SAP formatında tablo oluştur
  db.exec(`
    CREATE TABLE purchase_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- SAP OPRQ Fields (PascalCase) --
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
  console.log('✅ Yeni SAP formatında tablo oluşturuldu\n');

  // Verileri aktar
  db.exec(`
    INSERT INTO purchase_requests (
      id, DocNum, TaxDate, Reqdate, DocDueDate, DocDate, Reqname,
      U_TalepDurum, U_AcilMi, U_TalepOzeti, U_RevizeNedeni, U_RedNedeni,
      Comments, itemCount, status, createdAt, updatedAt
    )
    SELECT 
      id, doc_num, tax_date, req_date, doc_due_date, doc_date, req_name,
      u_talep_durum, u_acil_mi, u_talep_ozeti, u_revize_nedeni, u_red_nedeni,
      comments, item_count, status, created_at, updated_at
    FROM purchase_requests_old_columns;
  `);
  console.log('✅ Veriler aktarıldı\n');

  // İndeksler
  db.exec(`
    CREATE INDEX idx_purchase_requests_DocNum ON purchase_requests(DocNum);
    CREATE INDEX idx_purchase_requests_U_TalepDurum ON purchase_requests(U_TalepDurum);
  `);
  console.log('✅ İndeksler oluşturuldu\n');

  // Request Items tablosunu da güncelle
  db.exec(`DROP TABLE IF EXISTS request_items_old_columns;`);
  db.exec(`ALTER TABLE request_items RENAME TO request_items_old_columns;`);

  db.exec(`
    CREATE TABLE request_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestId INTEGER NOT NULL,            -- Internal
      
      -- SAP PRQ1 Fields (PascalCase) --
      OcrCode TEXT NOT NULL,                 -- PRQ1.OcrCode (Departman)
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
  console.log('✅ request_items tablosu SAP formatında\n');

  db.exec(`
    INSERT INTO request_items (
      id, requestId, OcrCode, ItemCode, ItemName, PQTRegdate,
      Quantity, UomCode, VendorCode, FreeTxt, isDummy, createdAt
    )
    SELECT 
      id, request_id, ocr_code, item_code, item_name, pqt_regdate,
      quantity, uom_code, vendor_code, free_txt, is_dummy, created_at
    FROM request_items_old_columns;
  `);
  console.log('✅ request_items verileri aktarıldı\n');

  db.exec(`CREATE INDEX idx_request_items_requestId ON request_items(requestId);`);

  // Kontrol
  console.log('📊 YENİ KOLON ADLARI (SAP Format):');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const prCols = db.prepare(`PRAGMA table_info(purchase_requests)`).all();
  console.log('🔹 PURCHASE_REQUESTS (OPRQ):');
  prCols.forEach(col => {
    if (!['id', 'itemCount', 'status', 'createdAt', 'updatedAt'].includes(col.name)) {
      console.log(`  ✓ ${col.name}`);
    }
  });

  console.log('\n🔹 REQUEST_ITEMS (PRQ1):');
  const riCols = db.prepare(`PRAGMA table_info(request_items)`).all();
  riCols.forEach(col => {
    if (!['id', 'requestId', 'isDummy', 'createdAt'].includes(col.name)) {
      console.log(`  ✓ ${col.name}`);
    }
  });

  const count = db.prepare('SELECT COUNT(*) as count FROM purchase_requests').get();
  console.log(`\n📊 Toplam kayıt: ${count.count}`);

  console.log('\n✅ Database kolonları SAP formatına çevrildi!');
  console.log('ℹ️  Eski kolonlar saklandı: *_old_columns tablolarında\n');

} catch (error) {
  console.error('❌ Hata:', error.message);
}

db.close();

