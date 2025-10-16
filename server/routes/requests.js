import express from 'express';
import db from '../database/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all purchase requests
router.get('/', (req, res) => {
  try {
    const { userId, userRole } = req.query;

    let query = `
      SELECT * FROM purchase_requests
      ORDER BY created_at DESC
    `;

    let requests;
    if (userRole === 'user') {
      // Kullanıcı sadece kendi taleplerini görsün
      query = `
        SELECT * FROM purchase_requests
        WHERE req_name = (SELECT name FROM users WHERE id = ?)
        ORDER BY created_at DESC
      `;
      requests = db.prepare(query).all(userId);
    } else {
      // Satınalmacı ve Admin tüm talepleri görsün
      requests = db.prepare(query).all();
    }

    // Her talep için item'ları getir
    const requestsWithItems = requests.map(request => {
      const items = db.prepare(`
        SELECT * FROM request_items WHERE request_id = ?
      `).all(request.id);

      return {
        id: request.id,
        DocNum: request.doc_num,
        TaxDate: request.tax_date,
        Reqdate: request.req_date,
        DocDueDate: request.doc_due_date,
        DocDate: request.doc_date,
        Reqname: request.req_name,
        requesterRole: request.requester_role,
        department: request.department,
        itemCount: request.item_count,
        status: request.status,
        U_AcilMi: request.u_acil_mi === 1,
        U_TalepOzeti: request.u_talep_ozeti,
        U_RevizeNedeni: request.u_revize_nedeni,
        U_RedNedeni: request.u_red_nedeni,
        Comments: request.comments,
        notes: request.notes,
        items: items.map(item => ({
          id: item.id,
          OcrCode: item.ocr_code,
          ItemCode: item.item_code,
          ItemName: item.item_name,
          PQTRegdate: item.pqt_regdate,
          Quantity: item.quantity,
          UomCode: item.uom_code,
          VendorCode: item.vendor_code,
          FreeTxt: item.free_txt,
          isDummy: item.is_dummy === 1
        }))
      };
    });

    res.json(requestsWithItems);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Create new purchase request
router.post('/', (req, res) => {
  try {
    const {
      DocNum,
      TaxDate,
      Reqdate,
      DocDueDate,
      DocDate,
      Reqname,
      requesterRole,
      department,
      U_AcilMi,
      U_TalepOzeti,
      Comments,
      items
    } = req.body;

    // Validasyon
    if (!DocNum || !DocDate || !Reqname || !items || items.length === 0) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }

    // Transaction başlat
    const insertRequest = db.transaction((requestData, itemsData) => {
      // Purchase request ekle
      const result = db.prepare(`
        INSERT INTO purchase_requests (
          doc_num, tax_date, req_date, doc_due_date, doc_date, req_name, requester_role,
          department, item_count, status, u_acil_mi, u_talep_ozeti, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Satınalma Talebi', ?, ?, ?)
      `).run(
        requestData.DocNum,
        requestData.TaxDate,
        requestData.Reqdate,
        requestData.DocDueDate,
        requestData.DocDate,
        requestData.Reqname,
        requestData.requesterRole || 'Talep Açan',
        requestData.department,
        itemsData.length,
        requestData.U_AcilMi ? 1 : 0,
        requestData.U_TalepOzeti,
        requestData.Comments
      );

      const requestId = result.lastInsertRowid;

      // Items ekle
      const insertItem = db.prepare(`
        INSERT INTO request_items (
          request_id, ocr_code, item_code, item_name, pqt_regdate,
          quantity, uom_code, vendor_code, free_txt, is_dummy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of itemsData) {
        insertItem.run(
          requestId,
          item.OcrCode,
          item.ItemCode,
          item.ItemName,
          item.PQTRegdate,
          item.Quantity,
          item.UomCode,
          item.VendorCode || null,
          item.FreeTxt || null,
          item.isDummy ? 1 : 0
        );
      }

      return requestId;
    });

    const requestId = insertRequest({ DocNum, TaxDate, Reqdate, DocDueDate, DocDate, Reqname, requesterRole, department, U_AcilMi, U_TalepOzeti, Comments }, items);

    res.json({
      success: true,
      requestId: requestId
    });
  } catch (error) {
    console.error('Create request error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Bu doküman numarası zaten mevcut' });
    }
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Update purchase request (for editing/revising)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      DocNum,
      TaxDate,
      Reqdate,
      DocDueDate,
      department,
      U_AcilMi,
      U_TalepOzeti,
      status,
      U_RevizeNedeni,
      U_RedNedeni,
      Comments,
      items
    } = req.body;

    // Transaction başlat
    const updateRequest = db.transaction((requestId, requestData, itemsData) => {
      // Purchase request güncelle
      db.prepare(`
        UPDATE purchase_requests
        SET doc_num = ?, tax_date = ?, req_date = ?, doc_due_date = ?, department = ?,
            item_count = ?, status = ?, u_acil_mi = ?, u_talep_ozeti = ?,
            u_revize_nedeni = ?, u_red_nedeni = ?, comments = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        requestData.DocNum,
        requestData.TaxDate,
        requestData.Reqdate,
        requestData.DocDueDate,
        requestData.department,
        itemsData ? itemsData.length : 0,
        requestData.status || 'Satınalma Talebi',
        requestData.U_AcilMi ? 1 : 0,
        requestData.U_TalepOzeti,
        requestData.U_RevizeNedeni || null,
        requestData.U_RedNedeni || null,
        requestData.Comments,
        requestId
      );

      // Eğer items gönderildiyse, mevcut item'ları sil ve yenilerini ekle
      if (itemsData && itemsData.length > 0) {
        db.prepare('DELETE FROM request_items WHERE request_id = ?').run(requestId);

        const insertItem = db.prepare(`
          INSERT INTO request_items (
            request_id, ocr_code, item_code, item_name, pqt_regdate,
            quantity, uom_code, vendor_code, free_txt, is_dummy
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of itemsData) {
          insertItem.run(
            requestId,
            item.OcrCode,
            item.ItemCode,
            item.ItemName,
            item.PQTRegdate,
            item.Quantity,
            item.UomCode,
            item.VendorCode || null,
            item.FreeTxt || null,
            item.isDummy ? 1 : 0
          );
        }
      }
    });

    updateRequest(id, { DocNum, TaxDate, Reqdate, DocDueDate, department, U_AcilMi, U_TalepOzeti, status, U_RevizeNedeni, U_RedNedeni, Comments }, items);

    res.json({ success: true });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Get next document number
router.get('/next-doc-number', (req, res) => {
  try {
    const result = db.prepare(`
      SELECT CAST(doc_num AS INTEGER) as num FROM purchase_requests
      ORDER BY CAST(doc_num AS INTEGER) DESC
      LIMIT 1
    `).get();

    const nextDocNumber = result ? String(result.num + 1) : '1';
    res.json({ nextDocNumber });
  } catch (error) {
    console.error('Get next doc number error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Load sample data from txt file
router.post('/load-sample-data', (req, res) => {
  try {
    const txtFilePath = path.join(__dirname, '../data/sample_requests.txt');

    if (!fs.existsSync(txtFilePath)) {
      return res.status(404).json({ error: 'Örnek veri dosyası bulunamadı' });
    }

    const fileContent = fs.readFileSync(txtFilePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    // Group lines by DocNum
    const requestsMap = new Map();

    lines.forEach(line => {
      const parts = line.split('|');
      if (parts.length < 17) return;

      const [
        docNum, taxDate, reqdate, docDueDate, reqname, department,
        uAcilMi, uTalepOzeti, comments, itemCode, itemName, pqtRegdate,
        quantity, uomCode, vendorCode, ocrCode, freeTxt
      ] = parts;

      if (!requestsMap.has(docNum)) {
        requestsMap.set(docNum, {
          DocNum: docNum,
          TaxDate: taxDate,
          Reqdate: reqdate,
          DocDueDate: docDueDate,
          DocDate: new Date().toLocaleDateString('tr-TR'),
          Reqname: reqname,
          department: department,
          U_AcilMi: uAcilMi === '1',
          U_TalepOzeti: uTalepOzeti,
          Comments: comments,
          items: []
        });
      }

      requestsMap.get(docNum).items.push({
        OcrCode: ocrCode,
        ItemCode: itemCode,
        ItemName: itemName,
        PQTRegdate: pqtRegdate,
        Quantity: quantity,
        UomCode: uomCode,
        VendorCode: vendorCode,
        FreeTxt: freeTxt,
        isDummy: itemCode === 'DUMMY'
      });
    });

    // Insert requests into database
    const insertRequest = db.transaction((requestsData) => {
      let insertedCount = 0;

      for (const requestData of requestsData) {
        try {
          // Check if request already exists
          const existing = db.prepare('SELECT id FROM purchase_requests WHERE doc_num = ?').get(requestData.DocNum);

          if (existing) {
            console.log(`Talep ${requestData.DocNum} zaten mevcut, atlanıyor...`);
            continue;
          }

          // Insert request
          const result = db.prepare(`
            INSERT INTO purchase_requests (
              doc_num, tax_date, req_date, doc_due_date, doc_date, req_name, requester_role,
              department, item_count, status, u_acil_mi, u_talep_ozeti, comments
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Satınalma Talebi', ?, ?, ?)
          `).run(
            requestData.DocNum,
            requestData.TaxDate,
            requestData.Reqdate,
            requestData.DocDueDate,
            requestData.DocDate,
            requestData.Reqname,
            'Talep Açan',
            requestData.department,
            requestData.items.length,
            requestData.U_AcilMi ? 1 : 0,
            requestData.U_TalepOzeti,
            requestData.Comments
          );

          const requestId = result.lastInsertRowid;

          // Insert items
          const insertItem = db.prepare(`
            INSERT INTO request_items (
              request_id, ocr_code, item_code, item_name, pqt_regdate,
              quantity, uom_code, vendor_code, free_txt, is_dummy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const item of requestData.items) {
            insertItem.run(
              requestId,
              item.OcrCode,
              item.ItemCode,
              item.ItemName,
              item.PQTRegdate,
              item.Quantity,
              item.UomCode,
              item.VendorCode,
              item.FreeTxt,
              item.isDummy ? 1 : 0
            );
          }

          insertedCount++;
        } catch (err) {
          console.error(`Error inserting request ${requestData.DocNum}:`, err);
        }
      }

      return insertedCount;
    });

    const requestsArray = Array.from(requestsMap.values());
    const insertedCount = insertRequest(requestsArray);

    res.json({
      success: true,
      message: `${insertedCount} adet örnek talep yüklendi`,
      totalProcessed: requestsArray.length,
      inserted: insertedCount
    });
  } catch (error) {
    console.error('Load sample data error:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
});

export default router;
