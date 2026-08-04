import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';

/**
 * SocketIOProvider for Yjs
 * Connects Y.Doc and Awareness states across client and backend over existing Socket.IO events.
 */
export class YjsSocketProvider {
    constructor(socket, roomId, doc, user = {}) {
        this.socket = socket;
        this.roomId = roomId;
        this.doc = doc;
        this.awareness = new Awareness(doc);
        this.user = user;

        // Set local awareness state (name, color, role)
        const userColors = [
            '#f59e0b', '#10b981', '#6366f1', '#ec4899', 
            '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'
        ];
        const randomColor = userColors[Math.floor(Math.random() * userColors.length)];
        
        this.awareness.setLocalStateField('user', {
            name: user.name || 'Anonymous Student',
            color: user.color || randomColor,
            role: user.role || 'student',
            id: user.id || user._id || 'user_' + Math.random().toString(36).substr(2, 6)
        });

        this._bindDocEvents();
        this._bindAwarenessEvents();
        this._bindSocketEvents();

        // Request current room state snapshot upon joining
        if (this.socket && this.roomId) {
            this.socket.emit('room:yjsJoin', { roomId: this.roomId });
        }
    }

    _bindDocEvents() {
        this._handleDocUpdate = (update, origin) => {
            if (origin !== this && this.socket && this.roomId) {
                this.socket.emit('room:yjsUpdate', {
                    roomId: this.roomId,
                    update: Array.from(update)
                });
            }
        };
        this.doc.on('update', this._handleDocUpdate);
    }

    _bindAwarenessEvents() {
        this._handleAwarenessUpdate = ({ added, updated, removed }, origin) => {
            if (origin !== this && this.socket && this.roomId) {
                const changedClients = added.concat(updated, removed);
                const update = encodeAwarenessUpdate(this.awareness, changedClients);
                this.socket.emit('room:yjsAwareness', {
                    roomId: this.roomId,
                    update: Array.from(update)
                });
            }
        };
        this.awareness.on('update', this._handleAwarenessUpdate);
    }

    _bindSocketEvents() {
        this._handleSocketDocInit = (data) => {
            if (data.roomId === this.roomId && data.state) {
                try {
                    Y.applyUpdate(this.doc, new Uint8Array(data.state), this);
                } catch (err) {
                    console.error('⚠️ Error applying initial Yjs doc state:', err);
                }
            }
        };

        this._handleSocketDocUpdate = (data) => {
            if (data.roomId === this.roomId && data.update) {
                try {
                    Y.applyUpdate(this.doc, new Uint8Array(data.update), this);
                } catch (err) {
                    console.error('⚠️ Error applying remote Yjs doc update:', err);
                }
            }
        };

        this._handleSocketAwareness = (data) => {
            if (data.roomId === this.roomId && data.update) {
                try {
                    applyAwarenessUpdate(this.awareness, new Uint8Array(data.update), this);
                } catch (err) {
                    console.error('⚠️ Error applying remote Yjs awareness update:', err);
                }
            }
        };

        this.socket.on('room:yjsInit', this._handleSocketDocInit);
        this.socket.on('room:yjsUpdate', this._handleSocketDocUpdate);
        this.socket.on('room:yjsAwareness', this._handleSocketAwareness);
    }

    destroy() {
        if (this.doc && this._handleDocUpdate) {
            this.doc.off('update', this._handleDocUpdate);
        }
        if (this.awareness && this._handleAwarenessUpdate) {
            this.awareness.off('update', this._handleAwarenessUpdate);
            this.awareness.destroy();
        }
        if (this.socket) {
            this.socket.off('room:yjsInit', this._handleSocketDocInit);
            this.socket.off('room:yjsUpdate', this._handleSocketDocUpdate);
            this.socket.off('room:yjsAwareness', this._handleSocketAwareness);
        }
    }
}
