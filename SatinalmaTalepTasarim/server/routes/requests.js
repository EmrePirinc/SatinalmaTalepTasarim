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
      ORDER BY createdAt DESC
    `;

    let requests;
    if (userRole === 'user') {
      // Kullanıcı sadece kendi taleplerini görsün
      query = `
        SELECT * FROM purchase_requests
        WHERE Reqname = (SELECT name FROM users WHERE id = ?)
        ORDER BY createdAt DESC
      `;
      requests = db.prepare(query).all(userId);
    } else {
      // Satınalmacı ve Admin tüm talepleri görsün
      requests = db.prepare(query).all();
    }

    // Her talep için item'ları getir
    const requestsWithItems = requests.map(request => {
      const items = db.prepare(`
        SELECT * FROM request_items WHERE requestId = ?
      `).all(request.id);

      return {
        // SAP OPRQ Fields (Direkt database kolonları)
        id: request.id,
        DocNum: request.DocNum,
        TaxDate: request.TaxDate,
        Reqdate: request.Reqdate,
        DocDueDate: request.DocDueDate,
        DocDate: request.DocDate,
        Reqname: request.Reqname,
        U_TalepDurum: request.U_TalepDurum,
        U_AcilMi: request.U_AcilMi === 1,
        U_TalepOzeti: request.U_TalepOzeti,
        U_RevizeNedeni: request.U_RevizeNedeni,
        U_RedNedeni: request.U_RedNedeni,
        Comments: request.Comments,
        
        // Internal fields
        itemCount: request.itemCount,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        
        // SAP PRQ1 Fields (Direkt database kolonları)
        items: items.map(item => ({
          id: item.id,
          OcrCode: item.OcrCode,
          ItemCode: item.ItemCode,
          ItemName: item.ItemName,
          PQTRegdate: item.PQTRegdate,
          Quantity: item.Quantity,
          UomCode: item.UomCode,
          VendorCode: item.VendorCode,
          FreeTxt: item.FreeTxt,
          isDummy: item.isDummy === 1
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
      // Purchase request ekle - SAP OPRQ (Direkt SAP kolonlar)
      const result = db.prepare(`
        INSERT INTO purchase_requests (
          DocNum, TaxDate, Reqdate, DocDueDate, DocDate, Reqname,
          itemCount, status, U_TalepDurum, U_AcilMi, U_TalepOzeti, Comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Satınalma Talebi', 'Satınalma Talebi', ?, ?, ?)
      `).run(
        requestData.DocNum,
        requestData.TaxDate,
        requestData.Reqdate,
        requestData.DocDueDate,
        requestData.DocDate,
        requestData.Reqname,
        itemsData.length,
        requestData.U_AcilMi ? 1 : 0,
        requestData.U_TalepOzeti,
        requestData.Comments
      );

      const requestId = result.lastInsertRowid;

      // Items ekle - SAP PRQ1 (Direkt SAP kolonlar)
      const insertItem = db.prepare(`
        INSERT INTO request_items (
          requestId, OcrCode, ItemCode, ItemName, PQTRegdate,
          Quantity, UomCode, VendorCode, FreeTxt, isDummy
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
      // Purchase request güncelle - SAP OPRQ (Direkt SAP kolonlar)
      db.prepare(`
        UPDATE purchase_requests
        SET DocNum = ?, TaxDate = ?, Reqdate = ?, DocDueDate = ?,
            itemCount = ?, status = ?, U_TalepDurum = ?, U_AcilMi = ?, U_TalepOzeti = ?,
            U_RevizeNedeni = ?, U_RedNedeni = ?, Comments = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        requestData.DocNum,
        requestData.TaxDate,
        requestData.Reqdate,
        requestData.DocDueDate,
        itemsData ? itemsData.length : 0,
        requestData.U_TalepDurum || 'Satınalma Talebi',
        requestData.U_TalepDurum || 'Satınalma Talebi',
        requestData.U_AcilMi ? 1 : 0,
        requestData.U_TalepOzeti,
        requestData.U_RevizeNedeni || null,
        requestData.U_RedNedeni || null,
        requestData.Comments,
        requestId
      );

      // Eğer items gönderildiyse, mevcut item'ları sil ve yenilerini ekle
      if (itemsData && itemsData.length > 0) {
        db.prepare('DELETE FROM request_items WHERE requestId = ?').run(requestId);

        const insertItem = db.prepare(`
          INSERT INTO request_items (
            requestId, OcrCode, ItemCode, ItemName, PQTRegdate,
            Quantity, UomCode, VendorCode, FreeTxt, isDummy
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
      SELECT CAST(DocNum AS INTEGER) as num FROM purchase_requests
      ORDER BY CAST(DocNum AS INTEGER) DESC
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
          const existing = db.prepare('SELECT id FROM purchase_requests WHERE DocNum = ?').get(requestData.DocNum);

          if (existing) {
            console.log(`Talep ${requestData.DocNum} zaten mevcut, atlanıyor...`);
            continue;
          }

          // Insert request - SAP OPRQ (Direkt SAP kolonlar)
          const result = db.prepare(`
            INSERT INTO purchase_requests (
              DocNum, TaxDate, Reqdate, DocDueDate, DocDate, Reqname,
              itemCount, status, U_TalepDurum, U_AcilMi, U_TalepOzeti, Comments
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Satınalma Talebi', 'Satınalma Talebi', ?, ?, ?)
          `).run(
            requestData.DocNum,
            requestData.TaxDate,
            requestData.Reqdate,
            requestData.DocDueDate,
            requestData.DocDate,
            requestData.Reqname,
            requestData.items.length,
            requestData.U_AcilMi ? 1 : 0,
            requestData.U_TalepOzeti,
            requestData.Comments
          );

          const requestId = result.lastInsertRowid;

          // Insert items - SAP PRQ1 (Direkt SAP kolonlar)
          const insertItem = db.prepare(`
            INSERT INTO request_items (
              requestId, OcrCode, ItemCode, ItemName, PQTRegdate,
              Quantity, UomCode, VendorCode, FreeTxt, isDummy
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
