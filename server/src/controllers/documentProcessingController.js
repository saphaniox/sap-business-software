import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/ai/process-document
 * Process document with OCR/AI (mock implementation)
 */
export async function processDocument(req, res) {
  try {
    const companyId = req.companyId;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    const { originalname, filename, mimetype, size } = req.file;

    // Mock document processing result
    // In production, this would call OCR service (Tesseract, Google Vision, AWS Textract, etc.)
    const extractedData = {
      text: 'Sample extracted text from document',
      confidence: 0.95,
      entities: {
        invoices: [],
        amounts: [],
        dates: [],
        names: []
      }
    };

    // Save to database
    const documentId = uuidv4();
    const now = new Date();

    await query(
      `INSERT INTO processed_documents 
      (id, company_id, user_id, original_name, file_name, mime_type, file_size, 
      extracted_data, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentId,
        companyId,
        userId,
        originalname,
        filename,
        mimetype,
        size,
        JSON.stringify(extractedData),
        'completed',
        now,
        now
      ]
    );

    res.json({
      success: true,
      document_id: documentId,
      extracted_data: extractedData,
      message: 'Document processed successfully'
    });

  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
}

/**
 * GET /api/ai/documents
 * Get processed documents list
 */
export async function getDocuments(req, res) {
  try {
    const companyId = req.companyId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [documents] = await query(
      `SELECT * FROM processed_documents 
       WHERE company_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [companyId, limit, offset]
    );

    const [totalResult] = await query(
      'SELECT COUNT(*) as total FROM processed_documents WHERE company_id = ?',
      [companyId]
    );

    const total = totalResult[0].total;

    // Parse JSON fields
    const parsedDocuments = documents.map(doc => ({
      ...doc,
      extracted_data: doc.extracted_data && typeof doc.extracted_data === 'string' 
        ? JSON.parse(doc.extracted_data) 
        : doc.extracted_data
    }));

    res.json({
      success: true,
      documents: parsedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}

/**
 * GET /api/ai/documents/:id
 * Get single processed document
 */
export async function getDocument(req, res) {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const [documents] = await query(
      'SELECT * FROM processed_documents WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documents[0];
    
    // Parse JSON field
    if (document.extracted_data && typeof document.extracted_data === 'string') {
      document.extracted_data = JSON.parse(document.extracted_data);
    }

    res.json({
      success: true,
      document
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
}

/**
 * DELETE /api/ai/documents/:id
 * Delete processed document
 */
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const [documents] = await query(
      'SELECT * FROM processed_documents WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documents[0];

    // Delete file from disk
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'uploads', 'documents', document.file_name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('File deletion error:', fileError);
    }

    // Delete from database
    await query(
      'DELETE FROM processed_documents WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}
