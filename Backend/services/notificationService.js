const { Admin, AdminNotif, DistributorNotif, Order } = require('../models');

class NotificationService {
    async notifyAdmins(notification, transaction) {
        try {
            const admins = await Admin.findAll({ 
                attributes: ['admin_id'],
                transaction 
            });

            const notifications = admins.map(admin => ({
                admin_id: admin.admin_id,
                header: notification.header,
                message: notification.message,
                status: 'unread'
            }));

            await AdminNotif.bulkCreate(notifications, { transaction });
            return true;
        } catch (error) {
            console.error('Error creating admin notifications:', error);
            throw error;
        }
    }

    async notifyDistributor(distributor_id, notification, transaction) {
        try {
            await DistributorNotif.create({
                distributor_id,
                header: notification.header,
                message: notification.message,
                status: 'unread'
            }, { transaction });
            return true;
        } catch (error) {
            console.error('Error creating distributor notification:', error);
            throw error;
        }
    }

    async notifyNewOrder(order_id, transaction) {
        const order = await Order.findByPk(order_id, {
            attributes: ['order_number'],
            transaction
        });

        return this.notifyAdmins({
            header: "New Order Received",
            message: `${order.order_number}: A new order has been received and is waiting for review.`
        }, transaction);
    }

    async notifyOrderStatusChange(order_id, distributor_id, oldStatus, newStatus, transaction) {
        const order = await Order.findByPk(order_id, {
            attributes: ['order_number'],
            transaction
        });

        const statusMessages = {
            processing: "Your order has been accepted and is now being processed",
            invoiced: "Your invoice is ready for review. Please check your email",
            invoiced: "Great news! Your order is on its way",
            delivered: "Your order has been successfully delivered",
            cancelled: "Your order has been cancelled. Please contact support if you have any questions"
        };

        const message = statusMessages[newStatus] || `Order status updated from ${oldStatus} to ${newStatus}`;

        return this.notifyDistributor(distributor_id, {
            header: "Order Update",
            message: `${order.order_number}: ${message}`
        }, transaction);
    }
}

module.exports = new NotificationService();