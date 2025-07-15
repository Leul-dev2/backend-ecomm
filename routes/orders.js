import express from 'express';
import admin from 'firebase-admin'; // Needed for FieldValue
import { db } from '../firebase.js';

const router = express.Router();

// GET /api/orders - Fetch all orders
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('timestamp', 'desc').get();

    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        status: data.status || 'Placed',
        total: data.total || 0,
        isPaid: data.isPaid || false,
        createdAt: data.timestamp?.toDate?.().toISOString() || null,
        shippingAddress: data.shippingAddress || {},
        userId: data.userId || null,
      };
    });

    res.json(orders);
  } catch (err) {
    console.error('🔥 Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/status - Update status of a specific order
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const orderRef = db.collection('orders').doc(id);

    await orderRef.update({
      status,
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        status,
        timestamp: admin.firestore.Timestamp.now(),
      }),
    });

    res.json({ message: `Order ${id} status updated to ${status}` });
  } catch (err) {
    console.error('❌ Error updating status:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// DELETE /api/orders/:id - Delete an order by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const orderRef = db.collection('orders').doc(id);
    await orderRef.delete();

    res.json({ message: `Order ${id} deleted successfully` });
  } catch (err) {
    console.error('❌ Error deleting order:', err);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

export default router;
