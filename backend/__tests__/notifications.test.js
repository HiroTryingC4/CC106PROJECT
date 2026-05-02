const request = require('supertest');
const express = require('express');
const session = require('express-session');

const notificationsRouter = require('../routes/notifications');

describe('Notifications Routes', () => {
  let app;
  let queryMock;
  let sendToUserMock;
  let broadcastMock;

  beforeEach(() => {
    queryMock = jest.fn(async (sql) => {
      const normalizedSql = String(sql).replace(/\s+/g, ' ').trim();

      if (normalizedSql.includes('SELECT role FROM users WHERE id = $1 LIMIT 1')) {
        return { rowCount: 1, rows: [{ role: 'guest' }] };
      }

      if (normalizedSql.includes('FROM user_notifications')) {
        if (normalizedSql.startsWith('SELECT COUNT(*)::int AS unread_count')) {
          return { rowCount: 1, rows: [{ unread_count: 1 }] };
        }
 
        return {
          rowCount: 1,
          rows: [
            {
              id: 11,
              user_id: 3,
              type: 'booking_confirmed',
              title: 'Booking Confirmed',
              message: 'Your booking is confirmed',
              is_read: false,
              created_at: '2026-04-29T00:00:00.000Z'
            }
          ]
        };
      }

      if (normalizedSql.includes('INSERT INTO user_notifications')) {
        return {
          rowCount: 1,
          rows: [
            {
              id: 21,
              user_id: 3,
              type: 'general',
              title: 'Notification',
              message: 'Hello',
              is_read: false,
              created_at: '2026-04-29T00:00:00.000Z'
            }
          ]
        };
      }

      if (normalizedSql.includes('UPDATE user_notifications') || normalizedSql.includes('DELETE FROM user_notifications')) {
        return { rowCount: 1, rows: [] };
      }

      if (normalizedSql.includes('FROM admin_notifications')) {
        if (normalizedSql.startsWith('SELECT COUNT(*)::int AS unread_count')) {
          return { rowCount: 1, rows: [{ unread_count: 2 }] };
        }

        return {
          rowCount: 1,
          rows: [
            {
              id: 31,
              type: 'general',
              title: 'Admin Notice',
              message: 'Admin notification',
              target_user_id: null,
              priority: 'medium',
              is_read: false,
              created_at: '2026-04-29T00:00:00.000Z'
            }
          ]
        };
      }

      if (normalizedSql.includes('INSERT INTO admin_notifications')) {
        return {
          rowCount: 1,
          rows: [
            {
              id: 32,
              type: 'general',
              title: 'Notification',
              message: 'Hello admin',
              target_user_id: null,
              priority: 'medium',
              is_read: false,
              created_at: '2026-04-29T00:00:00.000Z'
            }
          ]
        };
      }

      if (normalizedSql.includes('UPDATE admin_notifications') || normalizedSql.includes('DELETE FROM admin_notifications')) {
        return { rowCount: 1, rows: [] };
      }

      return { rowCount: 0, rows: [] };
    });

    sendToUserMock = jest.fn();
    broadcastMock = jest.fn();

    app = express();
    app.use(express.json());
    app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));
    app.locals.db = { query: queryMock };
    app.locals.websocket = { sendToUser: sendToUserMock, broadcast: broadcastMock };
    app.use('/api/notifications', notificationsRouter);
  });

  it('returns the current user notifications', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer token_3');

    expect(response.status).toBe(200);
    expect(response.body.scope).toBe('user');
    expect(response.body.total).toBe(1);
    expect(response.body.unreadCount).toBe(1);
    expect(response.body.notifications[0]).toMatchObject({
      id: 11,
      userId: 3,
      type: 'booking_confirmed'
    });
  });

  it('creates a user notification and emits it', async () => {
    const response = await request(app)
      .post('/api/notifications')
      .set('Authorization', 'Bearer token_3')
      .send({
        scope: 'user',
        type: 'message',
        title: 'New Message',
        message: 'You have a new message'
      });

    expect(response.status).toBe(201);
    expect(response.body.scope).toBe('user');
    expect(sendToUserMock).toHaveBeenCalledWith(
      3,
      'notification',
      expect.objectContaining({ scope: 'user', id: 21 })
    );
  });

  it('marks all user notifications as read', async () => {
    const response = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', 'Bearer token_3');

    expect(response.status).toBe(200);
    expect(response.body.updatedCount).toBe(1);
    expect(response.body.scope).toBe('user');
  });
});